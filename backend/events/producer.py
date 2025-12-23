import json
import logging
import os
import socket
from typing import Optional, Dict, Any
from django.db import transaction
from django.conf import settings
from confluent_kafka import Producer as KafkaProducer
from .schemas import BaseEvent

logger = logging.getLogger(__name__)

class Producer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Producer, cls).__new__(cls)
            cls._instance._producer = None
        return cls._instance

    @property
    def producer(self):
        if self._producer is None:
            conf = {
                'bootstrap.servers': os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092'),
                'client.id': socket.gethostname(),
                'acks': 'all',
                'enable.idempotence': True,
                'retries': 5,
                'delivery.timeout.ms': 30000,
                'linger.ms': 10
            }
            try:
                self._producer = KafkaProducer(conf)
                logger.info("Kafka Producer initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Kafka Producer: {e}")
                self._producer = None
        return self._producer

    def _delivery_report(self, err, msg):
        """Callback for delivery reports"""
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.info(f"Message delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}")

    def publish(self, topic: str, event: BaseEvent):
        """
        Publishes an event to Kafka.
        Uses Django's transaction.on_commit to ensure we only publish if the DB transaction succeeds.
        """
        def _do_publish():
            p = self.producer
            if not p:
                logger.warning("Kafka Producer not available, skipping event publish")
                return

            try:
                # Key validation: Use entity_id as partition key to ensure ordering
                key = str(event.entity_id)
                value = event.json() # Pydantic v1/v2 compat check needed? Assuming v1 style or standard .json()

                p.produce(
                    topic,
                    key=key,
                    value=value,
                    on_delivery=self._delivery_report
                )
                p.poll(0) # Trigger callbacks
                logger.info(f"Published event {event.event_type} (ID: {event.event_id}) to {topic}")
            except Exception as e:
                logger.error(f"Failed to publish event {event.event_id}: {e}")

        # Hook into Django transaction
        transaction.on_commit(_do_publish)

    def publish_immediate(self, topic: str, key: str, value: Dict[str, Any]):
        """
        Publishes immediately to Kafka (blocking/direct), bypassing Django transaction hooks.
        Used for DLQ and non-transactional contexts.
        """
        p = self.producer
        if not p:
            logger.warning(f"Kafka Producer not available, skipping immediate publish to {topic}")
            return

        try:
            # Ensure value is JSON serialized
            if not isinstance(value, str):
                payload = json.dumps(value, default=str)
            else:
                payload = value

            p.produce(
                topic,
                key=key,
                value=payload,
                on_delivery=self._delivery_report
            )
            p.poll(0)
            p.flush(timeout=1) # Ensure it goes out
            logger.info(f"Immediately published to {topic} (Key: {key})")
        except Exception as e:
            logger.error(f"Failed to immediate-publish to {topic}: {e}")
            raise # Re-raise because if DLQ fails, we shouldn't commit offset

    def flush(self, timeout=10):
        if self._producer:
            self._producer.flush(timeout)

# Global accessor
producer = Producer()

def publish_event(topic: str, event: BaseEvent):
    """Public utility to publish events"""
    producer.publish(topic, event)
