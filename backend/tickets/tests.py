from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Customer, Ticket
from ai_service.validators import (
    extract_and_parse_json,
    validate_ai_analysis_response,
    AIValidationError,
)
from ai_service.service import generate_mock_analysis


class TicketAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create(
            name="Rahul Sharma",
            email="rahul@example.com",
            phone="9876543210"
        )
        self.ticket = Ticket.objects.create(
            customer=self.customer,
            message="My payment was deducted but my order is still pending.",
            category=Ticket.CATEGORY_OTHER,
            priority=Ticket.PRIORITY_MEDIUM,
            sentiment=Ticket.SENTIMENT_NEUTRAL,
            status=Ticket.STATUS_PENDING
        )

    def test_create_ticket_with_new_customer(self):
        url = reverse('tickets:ticket-list-create')
        payload = {
            "customer": {
                "name": "Priya Patel",
                "email": "priya@example.com",
                "phone": "9123456780"
            },
            "message": "I cannot log into my account even after password reset."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('ticket_id', response.data)
        self.assertEqual(response.data['ticket']['customer']['email'], "priya@example.com")
        self.assertEqual(Customer.objects.filter(email="priya@example.com").count(), 1)

    def test_create_ticket_reuses_existing_customer(self):
        url = reverse('tickets:ticket-list-create')
        payload = {
            "customer": {
                "name": "Rahul Sharma",
                "email": "rahul@example.com",
                "phone": "9876543210"
            },
            "message": "Follow up regarding my earlier payment transaction."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.filter(email="rahul@example.com").count(), 1)
        self.assertEqual(self.customer.tickets.count(), 2)

    def test_create_ticket_validation_errors(self):
        url = reverse('tickets:ticket-list-create')
        payload = {
            "customer": {
                "name": "",
                "email": "not-an-email",
                "phone": ""
            },
            "message": "Hi"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)

    def test_list_tickets(self):
        url = reverse('tickets:ticket-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_ticket_details(self):
        url = reverse('tickets:ticket-detail-update', kwargs={'pk': self.ticket.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.ticket.id)
        self.assertEqual(response.data['customer']['email'], "rahul@example.com")

    def test_update_ticket_status_and_reply(self):
        url = reverse('tickets:ticket-detail-update', kwargs={'pk': self.ticket.id})
        payload = {
            "status": "In Progress",
            "ai_reply": "Dear Rahul, we are currently verifying your payment with the bank."
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, "In Progress")
        self.assertEqual(self.ticket.ai_reply, payload["ai_reply"])

    def test_ticket_stats(self):
        url = reverse('tickets:ticket-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 1)
        self.assertEqual(response.data['pending'], 1)

    def test_ai_analysis_endpoint(self):
        url = reverse('tickets:ticket-analyze', kwargs={'pk': self.ticket.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', response.data)
        self.assertEqual(response.data['analysis']['category'], "Payment Issue")
        self.assertEqual(response.data['analysis']['priority'], "High")
        self.assertEqual(response.data['analysis']['sentiment'], "Negative")

        # Verify saved in MySQL database
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.category, "Payment Issue")
        self.assertEqual(self.ticket.priority, "High")
        self.assertEqual(self.ticket.sentiment, "Negative")
        self.assertTrue(len(self.ticket.summary) > 0)
        self.assertTrue(len(self.ticket.ai_reply) > 0)

    def test_ai_validator_valid_payload(self):
        valid_json = {
            "category": "Payment Issue",
            "priority": "High",
            "sentiment": "Negative",
            "summary": "Customer payment was deducted, but order is still pending.",
            "recommended_action": "Verify the payment transaction and order status.",
            "suggested_reply": "We apologize for the inconvenience and are verifying your payment."
        }
        validated = validate_ai_analysis_response(valid_json)
        self.assertEqual(validated["category"], "Payment Issue")
        self.assertEqual(validated["priority"], "High")

    def test_ai_validator_invalid_category(self):
        invalid_json = {
            "category": "InvalidNonExistentCategory",
            "priority": "High",
            "sentiment": "Negative",
            "summary": "Sample summary",
            "recommended_action": "Sample action",
            "suggested_reply": "Sample reply"
        }
        with self.assertRaises(AIValidationError):
            validate_ai_analysis_response(invalid_json)

    def test_ai_validator_missing_fields(self):
        incomplete_json = {
            "category": "Payment Issue",
            "priority": "High"
        }
        with self.assertRaises(AIValidationError):
            validate_ai_analysis_response(incomplete_json)

    def test_extract_json_from_markdown(self):
        markdown_text = """```json
{
    "category": "Order Issue",
    "priority": "Medium",
    "sentiment": "Neutral",
    "summary": "Order query",
    "recommended_action": "Check order status",
    "suggested_reply": "Checking now"
}
```"""
        data = extract_and_parse_json(markdown_text)
        self.assertEqual(data["category"], "Order Issue")
