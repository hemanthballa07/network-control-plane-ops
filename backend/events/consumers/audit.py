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

    def process_message(self, msg):
        try:
            val = msg.value().decode('utf-8')
            data = json.loads(val)
            
            # Validate schema (Basic)
            # ideally use BaseEvent.parse_obj(data) but data includes dynamic payload
            event_id = data.get('event_id')
            
            if not event_id:
                logger.error(f"Skipping malformed message: missing event_id. Data: {val[:100]}...")
                return

            # Idempotency Check
            if EventLog.objects.filter(event_id=event_id).exists():
                logger.info(f"Skipping duplicate event {event_id}")
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
                    message=f"Event {data.get('event_type')} received via Kafka",
                )
            
            logger.info(f"Audit log created for event {event_id}")

        except json.JSONDecodeError:
            logger.error("Failed to decode JSON message", exc_info=True)
            # In a real system, send to DLQ here
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            # Retry or DLQ logic would go here

    def run(self):
        topics = KafkaTopics.list_all()
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

                # Process
                self.process_message(msg)

                # Commit offset ONLY after successful processing
                self.consumer.commit(asynchronous=False)

        except Exception as e:
            logger.exception("Audit Consumer crashed")
        finally:
            self.consumer.close()
            logger.info("Audit Consumer stopped")
