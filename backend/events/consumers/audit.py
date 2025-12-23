import json
import logging
import os
import signal
import sys
import time
from django.db import transaction, IntegrityError
from confluent_kafka import Consumer, KafkaException, KafkaError

from events.topics import KafkaTopics
from events.schemas import BaseEvent
from network.models import EventLog

logger = logging.getLogger(__name__)

class AuditConsumer:
    def __init__(self):
        self.running = True
        self.consumer = Consumer({
            'bootstrap.servers': os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092'),
            'group.id': 'audit_consumer_group',
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': False,  # Important: Manual commit
        })
        # Handle graceful shutdown
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)

    def shutdown(self, sig, frame):
        logger.info("Shutdown signal received...")
        self.running = False

    def publish_to_dlq(self, original_msg_val, error: Exception, context: str):
        """
        Publishes failed message to DLQ with metadata.
        """
        try:
            from events.producer import producer
            from events.topics import KafkaTopics
            import datetime
            import traceback

            payload = {
                "original_event": original_msg_val,
                "consumer": "AuditConsumer",
                "error_type": type(error).__name__,
                "error_message": str(error),
                "stacktrace": traceback.format_exc()[:1000],
                "failed_at": datetime.datetime.utcnow().isoformat(),
                "context": context
            }
            
            # Use a random new key or derive from original if possible, here using UUID
            import uuid
            dlq_key = str(uuid.uuid4())
            
            # Use immediate publish - we need this to succeed to commit the offset
            producer.publish_immediate(
                topic=KafkaTopics.DLQ_NODE, # Defaulting to generic DLQ topic
                key=dlq_key,
                value=payload
            )
            return True
        except Exception as e:
            logger.critical(f"FATAL: Failed to publish to DLQ! {e}")
            return False

    def process_message(self, msg):
        val = None
        try:
            val = msg.value().decode('utf-8')
            data = json.loads(val)
            
            event_id = data.get('event_id')
            if not event_id:
                raise ValueError("Missing event_id")

            # Idempotency Check
            if EventLog.objects.filter(event_id=event_id).exists():
                logger.debug(f"Skipping duplicate event {event_id}")
                return

            # Write to DB
            with transaction.atomic():
                EventLog.objects.create(
                    event_id=event_id,
                    event_type=data.get('event_type', 'UNKNOWN'),
                    entity_type=data.get('entity_type'),
                    entity_id=data.get('entity_id'),
                    correlation_id=data.get('correlation_id'),
                    payload=data,
                    message=f"Event {data.get('event_type')} received",
                )
            logger.info(f"Audit log created for event {event_id}")

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            # DLQ Strategy
            success = self.publish_to_dlq(val if val else "RAW_BYTES_DECODE_ERR", e, "process_message")
            if not success:
                # If DLQ fails, we must NOT commit offset. 
                # Raise exception to crash consumer or trigger backoff loop.
                raise Exception("DLQ Publish Failed - Halting to prevent data loss")

    def run(self):
        topics = KafkaTopics.list_all()
        # Filter out DLQ topics from subscription
        topics = [t for t in topics if "dlq" not in t]
        
        self.consumer.subscribe(topics)
        logger.info(f"Audit Consumer started. Subscribed to: {topics}")

        try:
            while self.running:
                msg = self.consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        logger.error(f"Consumer error: {msg.error()}")
                        continue

                # Process with Integrity
                try:
                    self.process_message(msg)
                    # Commit offset ONLY after successful processing OR successful DLQ
                    self.consumer.commit(asynchronous=False)
                except Exception as fatal_error:
                    logger.critical(f"Stopping consumer due to fatal error: {fatal_error}")
                    self.running = False

        except Exception as e:
            logger.exception("Audit Consumer crashed")
        finally:
            self.consumer.close()
            logger.info("Audit Consumer stopped")
