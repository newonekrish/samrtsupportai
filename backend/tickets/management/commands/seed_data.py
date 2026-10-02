import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from tickets.models import Customer, Ticket
from ai_service.service import analyze_ticket_message


class Command(BaseCommand):
    help = 'Seeds sample customer support tickets and executes AI analysis on them.'

    def handle(self, *args, **options):
        sample_path = settings.BASE_DIR.parent / 'sample-data' / 'tickets.json'

        if not sample_path.exists():
            self.stderr.write(self.style.ERROR(f"Sample data file not found at: {sample_path}"))
            return

        with open(sample_path, 'r', encoding='utf-8') as f:
            tickets_data = json.load(f)

        created_count = 0
        for item in tickets_data:
            cust_info = item['customer']
            customer, _ = Customer.objects.get_or_create(
                email=cust_info['email'].lower(),
                defaults={
                    'name': cust_info['name'],
                    'phone': cust_info.get('phone', ''),
                }
            )

            ticket, created = Ticket.objects.get_or_create(
                customer=customer,
                message=item['message'],
                defaults={'status': item.get('status', Ticket.STATUS_PENDING)}
            )

            # Analyze if not already analyzed
            if created or not ticket.summary:
                created_count += 1
                try:
                    analysis = analyze_ticket_message(ticket.message)
                    ticket.category = analysis['category']
                    ticket.priority = analysis['priority']
                    ticket.sentiment = analysis['sentiment']
                    ticket.summary = analysis['summary']
                    ticket.recommended_action = analysis['recommended_action']
                    ticket.ai_reply = analysis['suggested_reply']
                    ticket.save()
                    self.stdout.write(self.style.SUCCESS(
                        f"[OK] Ticket #{ticket.id} updated for {customer.name} (Category: {ticket.category}, Priority: {ticket.priority})"
                    ))
                except Exception as err:
                    self.stdout.write(self.style.WARNING(
                        f"[!] Ticket #{ticket.id} created without AI analysis: {err}"
                    ))
            else:
                self.stdout.write(f"[-] Ticket #{ticket.id} already exists for {customer.name}.")

        self.stdout.write(self.style.SUCCESS(
            f"\nSeeding complete. Processed {created_count} tickets in MySQL database."
        ))
