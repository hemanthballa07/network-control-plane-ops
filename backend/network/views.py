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
        node = self.get_object()
        # Logic to be implemented in Phase 6
        return Response({'status': 'heartbeat received'})

    @action(detail=True, methods=['post'])
    def provision(self, request, pk=None):
        """
        Trigger provisioning workflow.
        """
        node = self.get_object()
        # Logic to be implemented in Phase 5
        return Response({'status': 'provisioning started'}, status=status.HTTP_202_ACCEPTED)

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
