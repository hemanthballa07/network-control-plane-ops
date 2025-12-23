#!/bin/bash
set -e

echo "🚀 Starting E2E Kafka Verification..."

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker."
  exit 1
fi

# 2. Bring up infra
echo "📦 Bringing up infrastructure..."
docker compose -f infra/docker-compose.yml up -d --build

echo "⏳ Waiting for backend to be ready (10s)..."
sleep 10

# 3. Migrate
echo "🔄 Running migrations..."
docker compose -f infra/docker-compose.yml exec -T backend python manage.py migrate

# 4. Backfill
echo "📥 Running backfill..."
docker compose -f infra/docker-compose.yml exec -T backend python manage.py backfill_events

# 5. Smoke Test
echo "🔥 Running smoke test (Publishing event)..."
docker compose -f infra/docker-compose.yml exec -T backend python manage.py kafka_smoke_test

# 6. Verify EventLog (via shell one-liner)
echo "🔎 Verifying EventLog..."
docker compose -f infra/docker-compose.yml exec -T backend python manage.py shell -c "from network.models import EventLog; count = EventLog.objects.count(); print(f'EventLog Count: {count}'); exit(0 if count > 0 else 1)"

echo "✅ Verification Complete! System is operational."
