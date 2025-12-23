from django.test import TransactionTestCase
from django.utils import timezone
from django.conf import settings
import uuid
import time
import json
from unittest.mock import patch, MagicMock

from network.models import Node, EventLog
from network.services import NodeService
from events.consumers.audit import AuditConsumer
from events.topics import KafkaTopics

class KafkaIntegrationTest(TransactionTestCase):
    # We use TransactionTestCase because we need real DB transaction commit behavior
    # for on_commit hooks to fire.

    def setUp(self):
        # Clean slate
        EventLog.objects.all().delete()
        Node.objects.all().delete()

    @patch('events.producer.Producer.producer')
    def test_node_creation_emits_event_and_audit_consumer_writes_log(self, mock_producer_prop):
        """
        End-to-End simulation test:
        1. Service creates Node -> Emits Event (via mock producer to capture payload)
        2. We manually feed that payload into AuditConsumer logic (bypassing real Kafka)
        3. AuditConsumer writes to EventLog
        
        Note: True e2e with real Kafka requires Testcontainers or running infra.
        This test verifies the *logic flow* works correctly.
        """
        # 1. Setup Mock Producer to capture the produce call
        mock_kafka_producer = MagicMock()
        mock_producer_prop.return_value = mock_kafka_producer
        
        # 2. Trigger Service Action
        node_data = {
            "name": "Integration-Test-Node",
            "node_type": "SAT",
            "environment": "DEV",
            "mgmt_ip": "1.2.3.4"
        }
        node = NodeService.create_node(node_data)
        
        # 3. Verify Producer was called (after transaction commit)
        self.assertTrue(mock_kafka_producer.produce.called)
        call_args = mock_kafka_producer.produce.call_args
        topic, key, value = call_args[0][0], call_args[1].get('key'), call_args[1].get('value')
        
        self.assertEqual(topic, KafkaTopics.NODE_EVENTS)
        self.assertEqual(key, str(node.id))
        
        # 4. Simulate Consumer Processing
        # We take the value emitted by producer and feed it to consumer
        consumer = AuditConsumer()
        
        # Mock the Kafka Message object
        class MockMessage:
            def value(self):
                # Validation: producer emits JSON string or dict depending on serialization
                if isinstance(value, str):
                    return value.encode('utf-8')
                return json.dumps(value).encode('utf-8')
            def error(self): return None
            
        mock_msg = MockMessage()
        
        # Process message
        consumer.process_message(mock_msg)
        
        # 5. Assert EventLog created
        event_dict = json.loads(mock_msg.value().decode())
        event_id = event_dict['event_id']
        
        log_entry = EventLog.objects.get(event_id=event_id)
        self.assertEqual(log_entry.entity_id, str(node.id))
        self.assertEqual(log_entry.event_type, "NODE_CREATED")
        self.assertEqual(log_entry.payload['name'], "Integration-Test-Node")
        
        print(f"\n✅ Verified E2E Logic: Node {node.id} -> Event {event_id} -> Audit Log")
