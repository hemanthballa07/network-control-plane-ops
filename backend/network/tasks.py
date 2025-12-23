import time
import uuid
from celery import shared_task
from django.db import transaction
from .models import Node, WorkflowRun, EventLog

@shared_task(bind=True, max_retries=3)
def provision_node_task(self, workflow_run_id):
    try:
        workflow_run = WorkflowRun.objects.get(id=workflow_run_id)
        node = workflow_run.node
        correlation_id = workflow_run.correlation_id

        # Update state to RUNNING
        workflow_run.state = WorkflowRun.State.RUNNING
        workflow_run.save()

        # Log start
        EventLog.objects.create(
            node=node,
            workflow_run=workflow_run,
            event_type=EventLog.EventType.INFO,
            message="Starting provisioning process...",
            correlation_id=correlation_id
        )

        # Update Node status
        node.status = Node.Status.PROVISIONING
        node.save()

        # Simulate Verification Step
        time.sleep(2)
        EventLog.objects.create(
            node=node,
            workflow_run=workflow_run,
            event_type=EventLog.EventType.INFO,
            message="Hardware verification successful.",
            correlation_id=correlation_id
        )

        # Simulate IP Allocation
        time.sleep(2)
        if not node.mgmt_ip:
            node.mgmt_ip = f"10.0.0.{node.id.int % 255}"
            node.save()
        
        EventLog.objects.create(
            node=node,
            workflow_run=workflow_run,
            event_type=EventLog.EventType.INFO,
            message=f"IP Allocated: {node.mgmt_ip}",
            correlation_id=correlation_id
        )

        # Simulate Configuration
        time.sleep(2)
        node.status = Node.Status.HEALTHY
        node.applied_config_version = "v1.0.0"
        node.save()

        # Success!
        workflow_run.state = WorkflowRun.State.SUCCEEDED
        workflow_run.save()
        
        EventLog.objects.create(
            node=node,
            workflow_run=workflow_run,
            event_type=EventLog.EventType.STATE_CHANGE,
            message="Provisioning completed successfully. Node is HEALTHY.",
            correlation_id=correlation_id
        )

    except Exception as e:
        # Handle failure
        workflow_run = WorkflowRun.objects.get(id=workflow_run_id)
        workflow_run.state = WorkflowRun.State.FAILED
        workflow_run.error_message = str(e)
        workflow_run.save()
        
        if node:
            node.status = Node.Status.ERROR
            node.save()
            
            EventLog.objects.create(
                node=node,
                workflow_run=workflow_run,
                event_type=EventLog.EventType.ERROR,
                message=f"Provisioning failed: {str(e)}",
                correlation_id=workflow_run.correlation_id
            )
        
        # Retry logic for transient errors could go here
        # self.retry(exc=e, countdown=10)
