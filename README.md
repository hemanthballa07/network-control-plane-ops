# Network Control Plane & Operations Dashboard

> ### Project Complete ✅
>
> The **Network Control Plane & Operations Dashboard** is now complete and fully verified.
>
> **Key Capabilities**
>
> * Backend control plane built with **Django + DRF**, backed by **PostgreSQL**, fully containerized with **Docker Compose**.
> * Core domain models for **Nodes, Topology Links, WorkflowRuns, and EventLogs**, modeling real infrastructure state and operations.
> * REST APIs supporting full CRUD, topology views, and operational metrics.
> * **Async infrastructure workflows** implemented with **Celery + Redis**, including node provisioning and automated stale-node detection.
> * **Operator-facing UI** built in **React + TypeScript**, featuring a dark-mode dashboard for node management and topology visibility.
> * **Observability features** including correlation IDs, structured logging, and system metrics.
>
> **Verification**
>
> * Full backend test suite passing (API, workflows, and state transitions).
> * Frontend linting and validation completed.
> * End-to-end walkthrough documented in `walkthrough.md`.
>
> **Running Locally**
>
> * Backend: `make up` (Postgres, Redis, Django on `:8000`)
> * Frontend: `cd frontend && npm run dev` (UI on `:5173`)
>
> This project is designed to resemble **production-grade network and infrastructure management software**, emphasizing correctness, observability, and operator usability.

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

## User Interface

![Node List](file:///Users/hemanthballa/.gemini/antigravity/brain/bf93af00-ad75-492e-a8bc-0932a0f71a99/node_list_1766449001851.png)

*Figure 1: Node List Dashboard (showing empty state initialized structure)*

![Topology](file:///Users/hemanthballa/.gemini/antigravity/brain/bf93af00-ad75-492e-a8bc-0932a0f71a99/topology_1766449022152.png)

*Figure 2: Network Topology View*

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
- Node.js (for frontend)

### Quick Start
1. **Start the backend stack**:
   ```bash
   make up
   ```
2. **Start the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Access the App**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API Docs: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

## Design Decisions

- **Django + DRF**: Chosen for rapid iteration on complex data models.
- **Celery**: Handles long-running provisioning tasks that would time out a synchronous HTTP request.
- **Event Sourcing (Lite)**: An `EventLog` append-only stream serves as an audit trail.
- **Correlation IDs**: Distributed tracing simplified; every task and log shares a request ID.
- **Stale Node Detection**: A periodic background task (Celery Beat) assumes a node is UNREACHABLE if it misses heartbeats, simulating real-world NMS logic.

## Resume Points

**Network Control Plane & Ops Dashboard (Django, Postgres, React, Celery, Docker)**

* Designed and implemented a control-plane backend to manage network nodes, topology links, and configuration workflows using Django/DRF and PostgreSQL.
* Built operator-facing UI for provisioning, monitoring health, and troubleshooting via workflow history and audit event streams.
* Implemented async long-running workflows (Celery) with idempotency and retry handling to model reliable infrastructure operations.
* Added heartbeat-based health tracking and automated stale-node detection, improving operational visibility and incident response.
* Containerized services with Docker Compose and added API + task tests to prevent regressions.
