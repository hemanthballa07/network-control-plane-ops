from rest_framework import serializers
from .models import Node, Link, WorkflowRun, EventLog

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'last_heartbeat_at', 'applied_config_version')

class LinkSerializer(serializers.ModelSerializer):
    from_node_details = NodeSerializer(source='from_node', read_only=True)
    to_node_details = NodeSerializer(source='to_node', read_only=True)

    class Meta:
        model = Link
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'status', 'latency_ms', 'packet_loss')

    def validate(self, data):
        if data['from_node'] == data['to_node']:
            raise serializers.ValidationError("Cannot link a node to itself.")
        return data

class WorkflowRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowRun
        fields = '__all__'
        read_only_fields = ('id', 'state', 'correlation_id', 'error_message', 'created_at', 'updated_at')

class EventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventLog
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
