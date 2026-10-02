import logging
import requests
from django.conf import settings
from .prompts import build_analysis_prompt
from .validators import extract_and_parse_json, validate_ai_analysis_response
from .exceptions import (
    AIServiceError,
    AITimeoutError,
    AIAPIError,
    AIValidationError,
)

logger = logging.getLogger(__name__)


def generate_mock_analysis(message: str) -> dict:
    """
    Intelligent context-aware mock AI analyzer for development, testing, and interview demos.
    Generates deterministic, compliant responses following all business rules.
    """
    msg_lower = message.lower()

    if any(k in msg_lower for k in ["payment", "deduct", "charge", "card", "transaction", "bank"]):
        return {
            "category": "Payment Issue",
            "priority": "High",
            "sentiment": "Negative",
            "summary": "Customer payment was deducted, but the order status is still pending.",
            "recommended_action": "Verify payment transaction ID in gateway records and reconcile with billing system.",
            "suggested_reply": "We apologize for the inconvenience regarding your payment. We are investigating the transaction status with our billing team and will update you shortly.",
        }

    if any(k in msg_lower for k in ["login", "password", "account", "otp", "sign in", "credentials"]):
        return {
            "category": "Account Issue",
            "priority": "Medium",
            "sentiment": "Negative",
            "summary": "Customer is unable to authenticate or access their account.",
            "recommended_action": "Check account lock status and trigger a secure password reset link.",
            "suggested_reply": "Thank you for reaching out. We have reviewed your account status and sent secure verification steps to your registered email address.",
        }

    if any(k in msg_lower for k in ["delivery", "shipping", "courier", "track", "delayed", "package"]):
        return {
            "category": "Delivery Issue",
            "priority": "Medium",
            "sentiment": "Negative",
            "summary": "Customer reports shipment delay or tracking discrepancy for their delivery.",
            "recommended_action": "Contact logistics partner with shipment tracking number and expedite delivery.",
            "suggested_reply": "We apologize for the delivery delay. We have contacted our shipping partner for prioritized handling and an updated tracking timeline.",
        }

    if any(k in msg_lower for k in ["refund", "return", "reimburse", "money back"]):
        return {
            "category": "Refund Issue",
            "priority": "High",
            "sentiment": "Negative",
            "summary": "Customer is requesting refund status update for a returned item or cancelled order.",
            "recommended_action": "Audit refund eligibility and verify banking processing reference.",
            "suggested_reply": "We understand you are inquiring about your refund. Our accounts team has initiated the review and your refund reference will be provided within 24 hours.",
        }

    if any(k in msg_lower for k in ["error", "bug", "crash", "screen", "fail", "slow", "broken"]):
        return {
            "category": "Technical Issue",
            "priority": "High",
            "sentiment": "Negative",
            "summary": "Customer encountered an application error or technical glitch preventing normal use.",
            "recommended_action": "Review application error logs and forward stack details to engineering support.",
            "suggested_reply": "We are sorry you experienced this technical issue. Our engineering team has logged this report and is actively deploying a fix.",
        }

    if any(k in msg_lower for k in ["order", "cancel", "item", "purchase"]):
        return {
            "category": "Order Issue",
            "priority": "Medium",
            "sentiment": "Neutral",
            "summary": "Customer has a query or modification request regarding an active order.",
            "recommended_action": "Review order lifecycle status and verify fulfillment progress.",
            "suggested_reply": "Thank you for contacting customer support. We are checking the details of your order and will assist you with next steps immediately.",
        }

    return {
        "category": "Other",
        "priority": "Low",
        "sentiment": "Neutral",
        "summary": "General customer inquiry received for support assistance.",
        "recommended_action": "Assign to tier 1 customer support agent for initial inquiry triage.",
        "suggested_reply": "Thank you for reaching out to SmartSupport. A representative has received your request and will assist you shortly.",
    }


def call_llm_api(prompt: str) -> str:
    """
    Calls the external LLM API (Google Gemini 1.5 Flash endpoint).
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key:
        raise AIAPIError("External AI API key is not configured.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2
        }
    }

    try:
        response = requests.post(url, json=payload, timeout=12)
    except requests.exceptions.Timeout as err:
        raise AITimeoutError("AI API request timed out after 12 seconds.") from err
    except requests.exceptions.RequestException as err:
        raise AIAPIError(f"AI API network error: {str(err)}") from err

    if response.status_code != 200:
        raise AIAPIError(f"AI API returned error status {response.status_code}: {response.text}")

    data = response.json()
    try:
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return raw_text
    except (KeyError, IndexError) as err:
        raise AIValidationError("Unexpected response structure from Gemini API.") from err


def analyze_ticket_message(customer_message: str) -> dict:
    """
    Main entry point for AI analysis:
    1. Evaluates MOCK_AI flag and API key availability.
    2. Constructs prompt and executes query (or mock generator).
    3. Parses and strictly validates JSON output.
    4. Returns normalized clean dictionary.
    """
    use_mock = getattr(settings, 'MOCK_AI', True) or not getattr(settings, 'GEMINI_API_KEY', '')

    if use_mock:
        logger.info("Running AI ticket analysis in MOCK mode.")
        raw_mock = generate_mock_analysis(customer_message)
        # Validate mock output to ensure schema compliance
        return validate_ai_analysis_response(raw_mock)

    logger.info("Calling external LLM provider for ticket analysis.")
    prompt = build_analysis_prompt(customer_message)
    raw_response = call_llm_api(prompt)
    parsed_json = extract_and_parse_json(raw_response)
    validated_data = validate_ai_analysis_response(parsed_json)
    return validated_data
