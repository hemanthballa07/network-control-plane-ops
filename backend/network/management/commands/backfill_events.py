import uuid
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from network.models import Node
from events.schemas import NodeEvent
from events.topics import KafkaTopics
from events.producer import publish_event

class Command(BaseCommand):
    help = "Backfill Kafka events for existing Nodes to populate the Audit Log"

    def handle(self, *args, **options):
        nodes = Node.objects.all()
        count = nodes.count()
        self.stdout.write(f"Found {count} nodes to backfill...")

        success = 0
        for node in nodes:
            try:
                # Per-node transaction to ensure short lock times and immediate event publishing (via on_commit)
                with transaction.atomic():
                    # Construct Synthetic Event
                    # Use Node.created_at as the event timestamp
                    event_ts = node.created_at if node.created_at else timezone.now()
                    
                    event = NodeEvent(
                        event_id=str(uuid.uuid4()), # NEW unique ID
                        event_type="NODE_IMPORTED",
                        entity_type="node",
                        entity_id=str(node.id),
                        ts=event_ts,
                        correlation_id=str(uuid.uuid4()),
                        actor="system:backfill",
                        schema_version=1,
                        payload={
                            "name": node.name,
                            "type": node.node_type,
                            "environment": node.environment,
                            "synthetic": True,
                            "backfilled_at": str(timezone.now())
                        }
                    )
                    
                    # Publish
                    # We use standard publish_event which hooks into the transaction
                    publish_event(KafkaTopics.NODE_EVENTS, event)
                
                # Success increment outside transaction
                success += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to backfill node {node.id}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully queued backfill events for {success}/{count} nodes."))
