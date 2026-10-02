# SmartSupport AI — Intelligent Customer Support Ticket Assistant

> An interview-ready, full-stack AI system built with Python, Django REST Framework, MySQL, and React.js to assist customer support agents by automating first-level ticket triage, sentiment analysis, problem summarization, and human-in-the-loop response drafting.

---

## 1. Project Name
**SmartSupport AI** (AI-Powered Customer Support Ticket Assistant)

---

## 2. Project Overview
SmartSupport AI streamlines customer service triage by integrating large language models (LLMs) with enterprise database persistence and an intuitive React support dashboard. Rather than replacing human agents, SmartSupport AI empowers agents by extracting structured ticket intelligence (Category, Priority, Sentiment, Summary, Action Item, and Draft Response) in milliseconds while ensuring a human always verifies and approves every communication.

---

## 3. Business Problem
In customer support workflows, agents receive hundreds of inbound messages daily. For each ticket, agents must manually:
- Read and comprehend verbose or emotional messages.
- Determine the issue category (Payment, Account, Delivery, Technical, etc.).
- Gauge urgency and set appropriate escalation priority.
- Assess customer sentiment.
- Synthesize an executive summary.
- Formulate a recommended internal action.
- Draft an empathetic, compliant customer reply.

This manual process is slow, introduces inconsistent priority classification, and causes significant response delays during peak hours.

---

## 4. Proposed Solution
SmartSupport AI introduces a high-speed, automated first-level triage pipeline:
1. Customer submits an inquiry through the portal.
2. Django REST API validates and atomically creates or links the customer record and stores the ticket in MySQL.
3. The support agent clicks **"Analyze with AI"** (or triggers automatic ingestion).
4. The AI service processes the prompt under strict safety guidelines and returns structured JSON with schema enforcement.
5. Django validates and stores the AI analysis in MySQL.
6. The React dashboard renders the intelligence: category, priority badge, sentiment, summary, and action plan.
7. The agent reviews and edits the generated response before resolving the ticket.

---

## 5. Key Features
- **Atomic Customer & Ticket Ingestion**: Smart lookup by email avoids duplicate customer records.
- **Strict Schema AI Analysis**: Guarantees structured output (Category, Priority, Sentiment, Summary, Recommended Action, Suggested Reply).
- **Dual AI Mode (Real LLM & Mock Fallback)**:
  - Connects to Google Gemini 1.5 Flash (or OpenAI-compatible APIs).
  - Built-in context-aware Mock AI fallback (`MOCK_AI=true`) for offline development and interview presentations without API costs.
- **Human-in-the-Loop Response Editor**: Live `<textarea>` editor allows agents to tweak and save draft replies before closing tickets.
- **Real-Time Operational Dashboard**: Live metric counters for Total, High/Critical Priority, Pending, and Resolved tickets.
- **Multi-Filter & Instant Search**: Filter tickets by status, priority, and category with search indexing.
- **Database Indexing**: Optimized MySQL table schema with indexes on status, priority, category, and timestamps.
- **100% Secure**: Zero API keys exposed on the frontend; credentials managed via `.env`.

---

## 6. Technology Stack

### Backend
- **Python**: 3.13+
- **Django**: 5.2
- **Django REST Framework (DRF)**: 3.18
- **MySQL Driver**: PyMySQL + Cryptography
- **CORS**: `django-cors-headers`
- **Environment**: `python-dotenv`
- **HTTP/LLM Client**: `requests`

### Frontend
- **Framework**: React 19 (SPA via Vite)
- **Styling**: Bootstrap 5 + Modern Custom CSS Tokens
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios with centralized interceptors

### Database
- **MySQL Server**: 8.0 Community Server

---

## 7. Architecture Diagram

```
                    ┌────────────────────────┐
                    │    Support Employee    │
                    └───────────┬────────────┘
                                │
                                ▼
                     React 19 Frontend (Vite)
                     (Bootstrap + Lucide Icons)
                                │
                                │ Axios (VITE_API_URL)
                                ▼
                   Django REST Framework API
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
  Ticket Service                                 AI Service
(Business Logic & Validation)             (Prompts & Schema Validator)
         │                                             │
         ▼                                             ▼
  MySQL 8.0 Storage                             LLM API / Mock AI
(Customers & Tickets)                     (Gemini 1.5 Flash / Mock Engine)
```

---

## 8. Database Design

Two primary relational tables residing in MySQL `skillsupport_db`:

### `customers` Table
| Column Name | Data Type | Key | Description |
|---|---|---|---|
| `id` | `BIGINT` | PRIMARY KEY | Auto-increment identifier |
| `name` | `VARCHAR(150)` | | Customer's full name |
| `email` | `VARCHAR(254)` | INDEX | Contact email (unique search key) |
| `phone` | `VARCHAR(30)` | | Phone number |
| `created_at` | `DATETIME(6)` | INDEX | Account registration timestamp |

### `tickets` Table
| Column Name | Data Type | Key | Description |
|---|---|---|---|
| `id` | `BIGINT` | PRIMARY KEY | Auto-increment ticket number |
| `customer_id` | `BIGINT` | FOREIGN KEY | References `customers(id)` ON DELETE CASCADE |
| `message` | `LONGTEXT` | | Verbatim customer inquiry |
| `category` | `VARCHAR(50)` | INDEX | Payment, Order, Account, Delivery, Technical, Refund, Other |
| `priority` | `VARCHAR(20)` | INDEX | Low, Medium, High, Critical |
| `sentiment` | `VARCHAR(20)` | | Positive, Neutral, Negative |
| `summary` | `LONGTEXT` | | Executive AI problem summary |
| `recommended_action`| `LONGTEXT` | | Step-by-step guidance for agent |
| `ai_reply` | `LONGTEXT` | | Suggested draft reply for customer |
| `status` | `VARCHAR(30)` | INDEX | Pending, In Progress, Resolved |
| `created_at` | `DATETIME(6)` | INDEX | Timestamp created |
| `updated_at` | `DATETIME(6)` | | Timestamp last modified |

---

## 9. API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/tickets/` | Create a new ticket (with customer auto-linking) | `201 Created`, `400 Bad Request` |
| `GET` | `/api/tickets/` | List all tickets (supports `?search=`, `?status=`, `?priority=`) | `200 OK` |
| `GET` | `/api/tickets/stats/` | Aggregated dashboard KPI counters and category breakdowns | `200 OK` |
| `GET` | `/api/tickets/{id}/` | Retrieve full ticket details and history | `200 OK`, `404 Not Found` |
| `PATCH` | `/api/tickets/{id}/` | Update status or save employee-modified draft response | `200 OK`, `400 Bad Request` |
| `POST` | `/api/tickets/{id}/analyze/` | Execute AI analysis and save insights to MySQL | `200 OK`, `502 Gateway`, `504 Timeout` |

---

## 10. AI Integration & Safety Rules

- **Prompt Engineering**: Uses structured role prompting instructing the model to behave as an expert customer support triager.
- **Strict JSON Enforcement**: Enforces `response_mime_type: "application/json"`.
- **Validation Pipeline**:
  - Validates all 6 required fields are present.
  - Enforces enum consistency (Categories, Priorities, Sentiments).
  - Strips markdown formatting tags (` ```json `) automatically.
- **Safety Policy**:
  - The model is instructed **never** to invent customer details, payment amounts, or order IDs.
  - If information is missing, it explicitly notes that verification is required.
  - AI responses **never** auto-dispatch to customers; human agent approval is mandatory.

---

## 11. Folder Structure

```
smartsupport/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── config/
│   │   ├── __init__.py           # PyMySQL initialization
│   │   ├── settings.py           # MySQL, CORS, and DRF config
│   │   ├── urls.py               # API route definitions
│   │   └── wsgi.py
│   ├── tickets/
│   │   ├── admin.py              # Django admin registration
│   │   ├── models.py             # Customer & Ticket models
│   │   ├── serializers.py        # DRF serializers & validation
│   │   ├── views.py              # API views & controllers
│   │   ├── urls.py               # Ticket routes
│   │   ├── tests.py              # Unit & integration tests
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py  # Database seed script
│   └── ai_service/
│       ├── __init__.py
│       ├── service.py            # AI Engine & Mock generator
│       ├── prompts.py            # Master AI Prompt
│       ├── validators.py         # JSON parser & schema validator
│       └── exceptions.py         # Custom AI exceptions
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── DashboardCard.jsx
│       │   ├── TicketTable.jsx
│       │   ├── TicketCard.jsx
│       │   ├── PriorityBadge.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── AIAnalysis.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── ErrorMessage.jsx
│       │   ├── EmptyState.jsx
│       │   ├── SearchBar.jsx
│       │   └── FilterPanel.jsx
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── TicketListPage.jsx
│       │   ├── CreateTicketPage.jsx
│       │   └── TicketDetailsPage.jsx
│       ├── services/
│       │   └── api.js            # Axios client & endpoints
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── sample-data/
│   └── tickets.json              # 5 Real-world customer tickets
├── README.md
├── AI_Usage.md
└── .gitignore
```

---

## 12. Environment Variables

### Backend (`backend/.env`)
```ini
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,testserver

# MySQL Database Configuration
DB_NAME=skillsupport_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306

# AI Configuration
MOCK_AI=true
GEMINI_API_KEY=
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 13. Installation Guide

Ensure you have installed:
- Python 3.10+
- Node.js 18+ and npm
- MySQL Server 8.0

Clone the repository:
```powershell
cd c:\Users\balak\Downloads\smartsupport
```

---

## 14. MySQL Setup

1. Start your MySQL service:
```powershell
Get-Service -Name MySQL80
```
2. Log into MySQL and create the database:
```sql
CREATE DATABASE IF NOT EXISTS skillsupport_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 15. Backend Setup

1. Open PowerShell and navigate to `backend/`:
```powershell
cd backend
```
2. Activate virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```
3. Install backend packages:
```powershell
pip install -r requirements.txt
```
4. Run migrations:
```powershell
python manage.py migrate
```
5. Seed realistic sample tickets:
```powershell
python manage.py seed_data
```

---

## 16. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
```powershell
cd frontend
```
2. Install npm dependencies:
```powershell
npm install
```

---

## 17. Running the Project

### Start Backend (Terminal 1)
```powershell
cd backend
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```
*Backend is accessible at `http://127.0.0.1:8000/api/tickets/`*

### Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```
*Frontend will launch at `http://localhost:5173/`*

---

## 18. Testing

Run the Django automated test suite covering models, serializers, API views, AI validation, and mock engine:
```powershell
cd backend
.\venv\Scripts\python.exe manage.py test tickets
```
Expected output:
```
Ran 12 tests in 0.121s
OK
```

---

## 19. Sample Data
The repository includes 5 pre-built test cases in `sample-data/tickets.json`:
1. **Rahul Sharma** (Payment deducted, order pending).
2. **Priya Patel** (Account login failure).
3. **Arjun Verma** (Delivery delayed by 3 days).
4. **Ananya Roy** (Refund inquiry for past order).
5. **Kiran Kumar** (500 checkout error).

Run `python manage.py seed_data` to automatically load and analyze these scenarios.

---

## 20. Limitations
1. AI suggestions are guidance tools and require human verification before communicating with customers.
2. Categories and priorities are restricted to predefined business choices.
3. Does not directly execute billing refunds or courier dispatches (advisory only).
4. External LLM response times are dependent on third-party API availability.

---

## 21. Future Improvements
- Multi-channel support (inbound email parsing, WhatsApp, and Zendesk webhooks).
- Retrieval-Augmented Generation (RAG) using company internal knowledge bases and FAQs.
- Role-based Access Control (RBAC) separating Tier 1 agents from Team Leads.
- Multilingual translation and sentiment trend tracking over time.

---

## 22. AI Usage
Detailed AI engineering prompts and debugging history are documented in [AI_Usage.md](file:///c:/Users/balak/Downloads/smartsupport/AI_Usage.md).
