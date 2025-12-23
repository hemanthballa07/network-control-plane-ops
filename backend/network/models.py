import uuid
from django.db import models

class Node(models.Model):
    class NodeType(models.TextChoices):
        GROUND_STATION = 'GROUND', 'Ground Station'
        SATELLITE = 'SAT', 'Satellite'
        ROUTER = 'ROUTER', 'Router'
        GENERIC = 'GENERIC', 'Generic'

    class Environment(models.TextChoices):
        DEV = 'DEV', 'Development'
        STAGE = 'STAGE', 'Staging'
        PROD = 'PROD', 'Production'

    class Status(models.TextChoices):
        PROVISIONING = 'PROVISIONING', 'Provisioning'
        HEALTHY = 'HEALTHY', 'Healthy'
        DEGRADED = 'DEGRADED', 'Degraded'
        UNREACHABLE = 'UNREACHABLE', 'Unreachable'
        ERROR = 'ERROR', 'Error'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    node_type = models.CharField(max_length=20, choices=NodeType.choices, default=NodeType.GENERIC)
    environment = models.CharField(max_length=10, choices=Environment.choices, default=Environment.DEV)
    mgmt_ip = models.GenericIPAddressField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROVISIONING)
    
    last_heartbeat_at = models.DateTimeField(null=True, blank=True)
    desired_config_version = models.CharField(max_length=50, blank=True)
    applied_config_version = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.node_type})"


class Link(models.Model):
    class LinkType(models.TextChoices):
        RF = 'RF', 'RF'
        FIBER = 'FIBER', 'Fiber'
        VPN = 'VPN', 'VPN'
        GENERIC = 'GENERIC', 'Generic'

    class Status(models.TextChoices):
        UP = 'UP', 'Up'
        DOWN = 'DOWN', 'Down'
        DEGRADED = 'DEGRADED', 'Degraded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='outgoing_links')
    to_node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='incoming_links')
    link_type = models.CharField(max_length=20, choices=LinkType.choices, default=LinkType.GENERIC)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UP)
    
    latency_ms = models.IntegerField(null=True, blank=True)
    packet_loss = models.FloatField(null=True, blank=True) # Percentage 0-100
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.from_node.name} -> {self.to_node.name} ({self.link_type})"


class WorkflowRun(models.Model):
    class WorkflowType(models.TextChoices):
        PROVISION = 'PROVISION', 'Provision Node'
        APPLY_CONFIG = 'APPLY_CONFIG', 'Apply Configuration'
        RESTART_AGENT = 'RESTART_AGENT', 'Restart Agent'

    class State(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        RUNNING = 'RUNNING', 'Running'
        SUCCEEDED = 'SUCCEEDED', 'Succeeded'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='workflow_runs')
    workflow_type = models.CharField(max_length=50, choices=WorkflowType.choices)
    state = models.CharField(max_length=20, choices=State.choices, default=State.QUEUED)
    
    requested_by = models.CharField(max_length=100, default='system')
    correlation_id = models.UUIDField(default=uuid.uuid4)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.workflow_type} for {self.node.name} - {self.state}"


class EventLog(models.Model):
    class EventType(models.TextChoices):
        INFO = 'INFO', 'Info'
        WARN = 'WARN', 'Warning'
        ERROR = 'ERROR', 'Error'
        STATE_CHANGE = 'STATE_CHANGE', 'State Change'
        HEARTBEAT = 'HEARTBEAT', 'Heartbeat'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Generic Linkage (Kafka Style)
    event_id = models.UUIDField(unique=True, null=True, help_text="Idempotency key from Kafka")
    entity_id = models.CharField(max_length=255, null=True, blank=True, help_text="Partition key / Object ID")
    entity_type = models.CharField(max_length=50, null=True, blank=True)
    
    # Legacy/Direct FKs (Optional/Nullable now)
    node = models.ForeignKey(Node, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    workflow_run = models.ForeignKey(WorkflowRun, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    
    event_type = models.CharField(max_length=50, choices=EventType.choices, default=EventType.INFO)
    message = models.TextField(blank=True, help_text="Human readable summary")
    payload = models.JSONField(default=dict, blank=True, help_text="Full event body")
    
    correlation_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_id']),
            models.Index(fields=['entity_id']),
        ]

    def __str__(self):
        return f"[{self.event_type}] {self.entity_type}:{self.entity_id} - {self.message[:50]}"
