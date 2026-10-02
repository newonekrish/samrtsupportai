import json
import re
from typing import Dict, Any
from .exceptions import AIValidationError

ALLOWED_CATEGORIES = {
    "Payment Issue",
    "Order Issue",
    "Account Issue",
    "Technical Issue",
    "Delivery Issue",
    "Refund Issue",
    "Other",
}

ALLOWED_PRIORITIES = {"Low", "Medium", "High", "Critical"}

ALLOWED_SENTIMENTS = {"Positive", "Neutral", "Negative"}

REQUIRED_FIELDS = [
    "category",
    "priority",
    "sentiment",
    "summary",
    "recommended_action",
    "suggested_reply",
]


def extract_and_parse_json(raw_text: str) -> Dict[str, Any]:
    """
    Safely parses JSON from raw LLM output, stripping markdown code blocks if present.
    """
    if not raw_text or not isinstance(raw_text, str):
        raise AIValidationError("Raw AI response is empty or not a string.")

    cleaned = raw_text.strip()

    # Strip markdown ```json ... ``` or ``` ... ``` wrappers
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # Attempt to locate the first JSON object if surrounded by preamble
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as err:
        raise AIValidationError(f"AI response is not valid JSON: {str(err)}") from err

    if not isinstance(data, dict):
        raise AIValidationError("AI JSON payload must be an object (dictionary).")

    return data


def validate_ai_analysis_response(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Strictly validates the parsed JSON data against our schema rules.
    Returns normalized dictionary with capitalized/standardized fields.
    """
    # 1. Check all required fields are present
    missing = [field for field in REQUIRED_FIELDS if field not in data]
    if missing:
        raise AIValidationError(f"Missing required AI fields: {', '.join(missing)}")

    # 2. Extract and sanitize values
    category = str(data.get("category", "")).strip()
    priority = str(data.get("priority", "")).strip().capitalize()
    sentiment = str(data.get("sentiment", "")).strip().capitalize()
    summary = str(data.get("summary", "")).strip()
    recommended_action = str(data.get("recommended_action", "")).strip()
    suggested_reply = str(data.get("suggested_reply", "")).strip()

    # 3. Validate strings are non-empty
    for field_name, value in [
        ("summary", summary),
        ("recommended_action", recommended_action),
        ("suggested_reply", suggested_reply),
    ]:
        if not value:
            raise AIValidationError(f"AI field '{field_name}' cannot be empty.")

    # 4. Validate category
    # Case-insensitive match against allowed categories
    category_map = {c.lower(): c for c in ALLOWED_CATEGORIES}
    normalized_category = category_map.get(category.lower())
    if not normalized_category:
        raise AIValidationError(
            f"Invalid category '{category}'. Allowed: {sorted(list(ALLOWED_CATEGORIES))}"
        )

    # 5. Validate priority
    priority_map = {p.lower(): p for p in ALLOWED_PRIORITIES}
    normalized_priority = priority_map.get(priority.lower())
    if not normalized_priority:
        raise AIValidationError(
            f"Invalid priority '{priority}'. Allowed: {sorted(list(ALLOWED_PRIORITIES))}"
        )

    # 6. Validate sentiment
    sentiment_map = {s.lower(): s for s in ALLOWED_SENTIMENTS}
    normalized_sentiment = sentiment_map.get(sentiment.lower())
    if not normalized_sentiment:
        raise AIValidationError(
            f"Invalid sentiment '{sentiment}'. Allowed: {sorted(list(ALLOWED_SENTIMENTS))}"
        )

    return {
        "category": normalized_category,
        "priority": normalized_priority,
        "sentiment": normalized_sentiment,
        "summary": summary,
        "recommended_action": recommended_action,
        "suggested_reply": suggested_reply,
    }
