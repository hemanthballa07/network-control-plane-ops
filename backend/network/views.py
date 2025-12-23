from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Node, Link, WorkflowRun, EventLog
from .serializers import NodeSerializer, LinkSerializer, WorkflowRunSerializer, EventLogSerializer

class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer

    @extend_schema(summary="Get all nodes", description="List all network nodes")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def heartbeat(self, request, pk=None):
        """
        Receive heartbeat from a node.
        Updates last_heartbeat_at and status.
        """
        from django.utils import timezone
        
        node = self.get_object()
        
        # Update heartbeat
        node.last_heartbeat_at = timezone.now()
        
        # If node was UNREACHABLE/ERROR, mark it HEALTHY
        # (simplified logic, real world might vary)
        if node.status in [Node.Status.UNREACHABLE, Node.Status.ERROR]:
            node.status = Node.Status.HEALTHY
            EventLog.objects.create(
                node=node,
                event_type=EventLog.EventType.HEARTBEAT,
                message=f"Node recovered. Status: {node.status}"
            )
        
        node.save()
        
        return Response({'status': 'heartbeat received', 'current_status': node.status})

    @action(detail=True, methods=['post'])
    def provision(self, request, pk=None):
        """
        Trigger provisioning workflow.
        """
        node = self.get_object()
        
        # Check for existing running workflow (Idempotency)
        existing_run = WorkflowRun.objects.filter(
            node=node,
            workflow_type=WorkflowRun.WorkflowType.PROVISION,
            state__in=[WorkflowRun.State.QUEUED, WorkflowRun.State.RUNNING]
        ).first()

        if existing_run:
            serializer = WorkflowRunSerializer(existing_run)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new WorkflowRun
        run = WorkflowRun.objects.create(
            node=node,
            workflow_type=WorkflowRun.WorkflowType.PROVISION,
            requested_by=request.user.username or 'anonymous',
            state=WorkflowRun.State.QUEUED
        )

        # Trigger Celery Task
        from .tasks import provision_node_task
        provision_node_task.delay(run.id)

        serializer = WorkflowRunSerializer(run)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer

class TopologyViewSet(viewsets.ViewSet):
    """
    View to retrieve the entire network topology in one go.
    """
    @extend_schema(responses={200: 'OpenApiTypes.OBJECT'})
    def list(self, request):
        nodes = Node.objects.all()
        links = Link.objects.all()
        
        node_serializer = NodeSerializer(nodes, many=True)
        link_serializer = LinkSerializer(links, many=True)
        
        return Response({
            'nodes': node_serializer.data,
            'links': link_serializer.data
        })
