AI_MASTER_PROMPT = """You are an AI customer support assistant.

Analyze the customer support message below.

Return valid JSON with exactly these fields:

{{
    "category": "",
    "priority": "",
    "sentiment": "",
    "summary": "",
    "recommended_action": "",
    "suggested_reply": ""
}}

Customer message:

{customer_message}

Rules:

1. Keep the response professional and concise.
2. Do not invent customer information.
3. Do not invent order information.
4. Do not invent payment information.
5. If information is missing, say that verification is required.
6. Return JSON only.
7. Category must use one of the allowed categories:
   - Payment Issue
   - Order Issue
   - Account Issue
   - Technical Issue
   - Delivery Issue
   - Refund Issue
   - Other
8. Priority must use:
   Low
   Medium
   High
   Critical
9. Sentiment must use:
   Positive
   Neutral
   Negative
10. Suggested reply must be professional.
11. Suggested reply must be reviewed by a human before being sent.
12. Do not make unsupported claims.
"""


def build_analysis_prompt(customer_message: str) -> str:
    """
    Constructs the prompt with the customer message cleanly sanitized.
    """
    cleaned_message = customer_message.strip()
    return AI_MASTER_PROMPT.format(customer_message=cleaned_message)
