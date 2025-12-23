import logging
import uuid
from django.db import transaction
from .models import Node
from events.producer import publish_event
from events.schemas import NodeEvent
from events.topics import KafkaTopics

logger = logging.getLogger(__name__)

class NodeService:
    @staticmethod
    def create_node(data: dict, user=None) -> Node:
        """
        Creates a node and emits NODE_CREATED event.
        """
        with transaction.atomic():
            node = Node.objects.create(**data)
            
            # Construct Event
            event = NodeEvent(
                event_type="NODE_CREATED",
                entity_id=str(node.id),
                payload={
                    "name": node.name,
                    "type": node.node_type,
                    "environment": node.environment,
                    "ip": node.mgmt_ip
                },
                correlation_id=str(uuid.uuid4()), # Ideally passed from request context
                actor=user.username if user else "system"
            )
            
            # Publish (will happen on commit)
            publish_event(KafkaTopics.NODE_EVENTS, event)
            logger.info(f"Node {node.id} created and event queued.")
            
        return node

    @staticmethod
    def update_node_status(node_id: str, new_status: str, user=None) -> Node:
        with transaction.atomic():
            node = Node.objects.select_for_update().get(id=node_id)
            old_status = node.status
            node.status = new_status
            node.save()
            
            if old_status != new_status:
                event = NodeEvent(
                    event_type="NODE_STATUS_CHANGED",
                    entity_id=str(node.id),
                    payload={
                        "old_status": old_status,
                        "new_status": new_status,
                    },
                    correlation_id=str(uuid.uuid4()),
                    actor=user.username if user else "system"
                )
                publish_event(KafkaTopics.NODE_EVENTS, event)
        
        return node
