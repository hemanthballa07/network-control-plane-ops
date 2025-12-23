from enum import Enum

class KafkaTopics(str, Enum):
    NODE_EVENTS = "controlplane.node.events"
    WORKFLOW_EVENTS = "controlplane.workflow.events"
    
    DLQ_NODE = "controlplane.dlq.node"
    DLQ_WORKFLOW = "controlplane.dlq.workflow"

    @classmethod
    def list_all(cls):
        return [t.value for t in cls]
