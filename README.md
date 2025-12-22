# Network Control Plane & Operations Dashboard

**A control-plane backend to manage network nodes, topology links, and configuration workflows.**

This project acts as the central nervous system for a distributed network (satellites, ground stations, routers). It allows operators to provision nodes, visualize topology, and execute long-running maintenance workflows with full auditability.

## Architecture

```ascii
[Operator UI (React)]
       |
       v
[ Django API (DRF) ]  <--->  [ PostgreSQL (State) ]
       |
       +---> [ Celery Workers ] <---> [ Redis (Broker) ]
                   |
                   +---> [ Node Provisioning / Config ]
```

## Features

- **Node Management**: Register and track lifecycle of Ground Stations, Satellites, and Routers.
- **Topology**: Define and visualize links (RF, Fiber, VPN) between nodes.
- **Async Workflows**: Reliable provisioning and configuration application using Celery.
- **Observability**: Structured logging, correlation IDs, and event sourcing for audit trails.
- **Health Monitoring**: Heartbeat tracking with automated stale node detection.

## Tech Stack

- **Backend**: Django 5, Django REST Framework
- **Database**: PostgreSQL
- **Async Task Queue**: Celery + Redis
- **Frontend**: React + TypeScript
- **Infrastructure**: Docker Compose

## Running Locally

### Prerequisites
- Docker & Docker Compose

### Quick Start
1. **Start the stack**:
   ```bash
   make up
   ```
2. **Access the API**:
   Open [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) for Swagger UI.
3. **Run Tests**:
   ```bash
   make test
   ```

## Design Decisions

- **Django + DRF**: Chosen for robust ORM and rapid API development capabilities suited for complex domain models.
- **Celery**: Handles long-running provisioning tasks that would time out a synchronous HTTP request.
- **Event Sourcing (Lite)**: An `EventLog` append-only stream is used alongside current state to allow debugging of *why* a node is in a specific state.
- **Correlation IDs**: Every request and background task carries a `correlation_id` to trace operations across the stack.

## Future Work

- [ ] Real-time WebSocket updates for topology changes.
- [ ] Integration with AWS SQS for production queues.
- [ ] RBAC for different operator levels.
