import uuid
from datetime import datetime
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class EventType(str):
    # Node Events
    NODE_CREATED = "NODE_CREATED"
    NODE_UPDATED = "NODE_UPDATED"
    NODE_DELETED = "NODE_DELETED"
    NODE_IMPORTED = "NODE_IMPORTED"
    
    # Workflow Events
    PROVISION_REQUESTED = "PROVISION_REQUESTED"
    PROVISION_STARTED = "PROVISION_STARTED"
    PROVISION_SUCCEEDED = "PROVISION_SUCCEEDED"
    PROVISION_FAILED = "PROVISION_FAILED"

class BaseEvent(BaseModel):
    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    event_type: str
    entity_type: Literal["node", "workflow"]
    entity_id: str
    ts: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None
    actor: str = "system"
    schema_version: int = 1
    payload: Dict[str, Any]

    class Config:
        json_encoders = {
            uuid.UUID: lambda u: str(u),
            datetime: lambda dt: dt.isoformat()
        }

class NodeEvent(BaseEvent):
    entity_type: Literal["node"] = "node"

class WorkflowEvent(BaseEvent):
    entity_type: Literal["workflow"] = "workflow"
