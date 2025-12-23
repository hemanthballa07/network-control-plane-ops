export interface Node {
    id: string;
    name: string;
    node_type: 'GROUND' | 'SAT' | 'ROUTER' | 'GENERIC';
    environment: 'DEV' | 'STAGE' | 'PROD';
    mgmt_ip?: string;
    status: 'PROVISIONING' | 'HEALTHY' | 'DEGRADED' | 'UNREACHABLE' | 'ERROR';
    last_heartbeat_at?: string;
    desired_config_version?: string;
    applied_config_version?: string;
    created_at: string;
    updated_at: string;
}

export interface Link {
    id: string;
    from_node: string;
    to_node: string;
    from_node_details?: Node;
    to_node_details?: Node;
    link_type: 'RF' | 'FIBER' | 'VPN' | 'GENERIC';
    status: 'UP' | 'DOWN' | 'DEGRADED';
    latency_ms?: number;
    packet_loss?: number;
}

export interface WorkflowRun {
    id: string;
    node: string;
    workflow_type: 'PROVISION' | 'APPLY_CONFIG' | 'RESTART_AGENT';
    state: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    requested_by: string;
    correlation_id: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
}

export interface EventLog {
    id: string;
    node?: string;
    workflow_run?: string;
    event_type: 'INFO' | 'WARN' | 'ERROR' | 'STATE_CHANGE' | 'HEARTBEAT';
    message: string;
    correlation_id?: string;
    created_at: string;
}

export interface TopologyData {
    nodes: Node[];
    links: Link[];
}
