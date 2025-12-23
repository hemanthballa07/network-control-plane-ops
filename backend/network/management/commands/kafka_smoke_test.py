import uuid
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from events.topics import KafkaTopics
from events.producer import publish_event
from events.schemas import NodeEvent

class Command(BaseCommand):
    help = "Publishes a single NODE_* event to Kafka to verify connectivity and config."

    def add_arguments(self, parser):
        parser.add_argument("--event-type", default="NODE_SMOKE_TEST")
        parser.add_argument("--node-id", default=None)
        parser.add_argument("--correlation-id", default=None)

    def handle(self, *args, **options):
        node_id = options["node_id"] or str(uuid.uuid4())
        correlation_id = options["correlation_id"] or str(uuid.uuid4())
        event_type = options["event_type"]

        self.stdout.write(f"Preparing to publish {event_type} for node {node_id}...")

        # Construct Event
        try:
            event = NodeEvent(
                event_id=str(uuid.uuid4()),
                event_type=event_type,
                entity_type="node",
                entity_id=node_id,
                ts=timezone.now(),
                correlation_id=correlation_id,
                actor="system:kafka_smoke_test",
                schema_version=1,
                payload={
                    "note": "hello from kafka_smoke_test",
                    "node_id": node_id,
                    "timestamp": str(timezone.now())
                },
            )

            # IMPORTANT: enforce on_commit semantics
            # We wrap in atomic block just like production service code
            with transaction.atomic():
                publish_event(KafkaTopics.NODE_EVENTS, event)
                self.stdout.write("Event queued in transaction...")

            # If we reach here, transaction committed and on_commit hook fired
            self.stdout.write(self.style.SUCCESS(f"Successfully published event {event.event_id} to {KafkaTopics.NODE_EVENTS}"))
            self.stdout.write(f"Check Kafdrop or Audit Log for event_id: {event.event_id}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to publish event: {e}"))
