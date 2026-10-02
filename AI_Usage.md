# AI Usage Documentation — SmartSupport AI

This document outlines the key prompt engineering, architectural designs, API generation, debugging scenarios, and review steps utilized during the creation of **SmartSupport AI**.

---

## 1. Architecture Design Prompt

### Objective
Design a scalable, decoupled, interview-ready full-stack architecture combining a React SPA, a Django REST API, MySQL database persistence, and a modular AI service.

### Prompt Used
> *"You are a senior full-stack software architect. Design a clean, decoupled architecture for 'SmartSupport AI', a customer support assistant. The stack must use React (Vite) on the frontend, Django REST Framework on the backend, and MySQL for database storage. Separate the AI integration into a distinct service package so the views don't talk directly to LLM providers. Ensure support employees retain final editing control over all AI-suggested responses."*

### Key Architecture Decisions Derived
- **Decoupled AI Engine**: Built `backend/ai_service/` containing isolated modules (`prompts.py`, `validators.py`, `service.py`, `exceptions.py`). The Django views only consume high-level abstractions (`analyze_ticket_message`).
- **Atomic Customer Ingestion**: De-duplicating customer records by email during ticket creation with `Customer.objects.get_or_create()`.
- **Hybrid AI Fallback**: Support zero-config offline mode with intelligent context-aware mock responses when no API key is set, enabling seamless local demos and tests.

---

## 2. AI Prompt Design & Structured Output

### Objective
Craft a zero-hallucination, strictly formatted prompt that outputs structured JSON for support ticket classification and drafting.

### Prompt Used
> *"You are an AI customer support assistant. Analyze the customer support message below. Return valid JSON only with exactly these fields: category, priority, sentiment, summary, recommended_action, suggested_reply. Follow these constraints: 1. Keep responses professional. 2. Never invent order or transaction numbers. 3. If information is missing, state that verification is required. 4. Category must match allowed list: Payment Issue, Order Issue, Account Issue, Technical Issue, Delivery Issue, Refund Issue, Other. 5. Priority must use Low, Medium, High, Critical. 6. Sentiment must use Positive, Neutral, Negative."*

### Key Implementation Outcome
- Created `backend/ai_service/prompts.py` and `backend/ai_service/validators.py`.
- Implemented robust regex markdown tag stripper (` ```json ... ``` `) and schema checks ensuring every response conform to the allowed choices and non-empty string constraints.

---

## 3. Django REST API Generation

### Objective
Implement atomic customer lookup and ticket creation in Django REST Framework with serialized validation.

### Prompt Used
> *"Generate Django REST Framework serializers and views for Customer and Ticket models. The ticket creation endpoint (POST /api/tickets/) must accept customer object (name, email, phone) and message in a single payload. Look up existing customers by email or create a new record atomically. Provide search, status filtering, and priority filtering on the ticket list view."*

### Key Implementation Outcome
- Created `TicketCreateSerializer` and `TicketUpdateSerializer` in `backend/tickets/serializers.py`.
- Wrote API views `TicketListCreateView`, `TicketDetailUpdateView`, `TicketAnalyzeView`, and `TicketStatsView`.
- Developed 12 automated unit tests passing in 0.12s.

---

## 4. Debugging & Real-World Fixes

### Issue 1: PyMySQL Method Casing on Python 3.13 Windows
- **Symptom**: Running `python manage.py check` threw `AttributeError: module 'pymysql' has no attribute 'install_as_mysqldb'`.
- **Root Cause**: PyMySQL method name is case-sensitive: `install_as_MySQLdb()` with capitalized `M` and `SQLdb`.
- **Resolution**: Updated `backend/config/__init__.py` to `pymysql.install_as_MySQLdb()`.

### Issue 2: Windows Console Charmap Unicode Error During Database Seeding
- **Symptom**: `python manage.py seed_data` threw `'charmap' codec can't encode character '\u2713' in position 0`.
- **Root Cause**: Windows command prompt default codepage (CP1252) cannot encode Unicode checkmark `✓`.
- **Resolution**: Replaced terminal checkmark symbols with ASCII `[OK]` tokens in `backend/tickets/management/commands/seed_data.py`.

---

## 5. Project Review & Human-in-the-Loop AI Safety

### Objective
Audit the end-to-end full-stack pipeline for enterprise compliance, LLM safety, and error handling.

### Prompt Used
> *"Review the SmartSupport AI workflow from an AI safety and software engineering perspective. What vulnerabilities or design flaws exist if an LLM is used in customer support?"*

### Review Findings & Adopted Guardrails
1. **Never Auto-Send**: AI output is strictly a draft (`ai_reply`) rendered in an editable `<textarea>` on the frontend. The agent can modify or discard the text before saving.
2. **Defensive Validation**: If the LLM generates an invalid category or malformed JSON, Django captures the error via `AIValidationError` and returns a clean HTTP 502 without corrupting database records.
3. **Environment Security**: No API keys or database passwords reside in frontend bundles or Git history.
