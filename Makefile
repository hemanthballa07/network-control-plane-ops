.PHONY: up down migrate test

up:
	docker compose -f infra/docker-compose.yml up -d

down:
	docker compose -f infra/docker-compose.yml down

logs:
	docker compose -f infra/docker-compose.yml logs -f

migrate:
	docker compose -f infra/docker-compose.yml exec backend python manage.py migrate

makemigrations:
	docker compose -f infra/docker-compose.yml exec backend python manage.py makemigrations

test:
	docker compose -f infra/docker-compose.yml exec backend pytest
