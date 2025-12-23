from django.core.management.base import BaseCommand
from events.consumers.audit import AuditConsumer

class Command(BaseCommand):
    help = "Runs the Audit Consumer to ingest Kafka events into EventLog"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Audit Consumer..."))
        consumer = AuditConsumer()
        consumer.run()
