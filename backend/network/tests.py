from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from .models import Node, WorkflowRun

class NodeModelTests(TestCase):
    def test_node_defaults(self):
        node = Node.objects.create(name="Test Sat")
        self.assertEqual(node.status, Node.Status.PROVISIONING)
        self.assertEqual(node.node_type, Node.NodeType.GENERIC)

class NodeAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.node = Node.objects.create(name="Gateway 1", status=Node.Status.HEALTHY)

    def test_list_nodes(self):
        url = reverse('node-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_heartbeat(self):
        url = reverse('node-heartbeat', args=[self.node.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.node.refresh_from_db()
        self.assertIsNotNone(self.node.last_heartbeat_at)

    @patch('network.tasks.provision_node_task.delay')
    def test_provision_trigger(self, mock_task):
        url = reverse('node-provision', args=[self.node.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        
        # Check Workflow created
        self.assertTrue(WorkflowRun.objects.filter(node=self.node).exists())
        # Check Task called
        mock_task.assert_called_once()

    @patch('network.tasks.provision_node_task.delay')
    def test_provision_idempotency(self, mock_task):
        # Create existing run
        WorkflowRun.objects.create(
            node=self.node,
            workflow_type=WorkflowRun.WorkflowType.PROVISION,
            state=WorkflowRun.State.RUNNING
        )
        
        url = reverse('node-provision', args=[self.node.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Task NOT called again
        mock_task.assert_not_called()
