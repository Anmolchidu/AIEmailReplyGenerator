code turtles
Ganesh Reddy Maredla(Team Lead)
Abhishek Repala
Hrithik Mohan Singh Takur 
# AI Email Assistant

A production-ready full-stack SaaS application that uses Google Gemini AI to generate context-aware email replies. Paste an email, pick a tone, get three ready-to-send reply options with intent detection, emotion analysis, and priority classification — then send directly via Gmail SMTP.

---

## Features

- **AI Reply Generation** — 3 reply options per request (direct, balanced, expressive)
- **Context Memory** — uses last 5 messages from conversation thread for continuity
- **Email Intelligence** — intent detection, emotion detection, priority classification, thread summarization
- **Gmail SMTP Sending** — send emails directly from the app using your Gmail App Password
- **JWT Authentication** — register, login, auto token refresh
- **Conversation Threads** — group emails into threads, view as chat bubbles
- **Draft System** — auto-save every 30s, manual save with Ctrl+S
- **Email History** — full log of every email sent
- **Analytics** — tone usage breakdown and send statistics
- **Dark Mode** — full dark/light theme toggle
- **Keyboard Shortcuts** — Ctrl+Enter to generate, Ctrl+S to save draft
- **Gmail-like UI** — sidebar navigation, topbar search, multi-panel dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Bootstrap 5, Axios, React Router, React Hot Toast |
| Backend | Django 6, Django REST Framework, SimpleJWT |
| AI | Google Gemini 2.5 Flash (google-genai SDK) |
| Email | Gmail SMTP via Python smtplib (SSL 465 / STARTTLS 587) |
| Database | SQLite (dev) |
| Auth | JWT (access 1 day, refresh 7 days) |

---

## Project Structure

```
├── email_reply_generator/          # Django backend
│   ├── email_reply_generator/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── generator/
│   │   ├── models.py               # User, Conversation, Message, Draft, EmailHistory
│   │   ├── serializers.py          # Input validation for all endpoints
│   │   ├── views.py                # All API view classes
│   │   ├── services.py             # Gemini AI + Gmail SMTP logic
│   │   └── urls.py                 # API route definitions
│   ├── .env                        # Environment variables (not committed)
│   └── manage.py
│
└── frontend/                       # React frontend
    └── src/
        ├── context/
        │   └── AuthContext.js      # JWT auth state
        ├── services/
        │   └── api.js              # Axios client with auto token refresh
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   └── DashboardPage.js
        └── components/
            ├── Sidebar.js
            ├── Topbar.js
            ├── Composer.js         # Core AI compose + send UI
            ├── InboxPanel.js
            ├── DraftsPanel.js
            ├── HistoryPanel.js
            ├── AnalyticsPanel.js
            └── SettingsPanel.js
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)
- A Gmail account with 2-Step Verification enabled and an App Password generated

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-email-assistant.git
cd ai-email-assistant
```

### 2. Backend setup

```bash
cd email_reply_generator
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers google-genai python-dotenv
```

Create a `.env` file inside `email_reply_generator/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_django_secret_key_here
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## Gmail App Password Setup

Gmail requires an App Password (not your regular password) for SMTP access.

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Search for **App Passwords**
4. Select **Mail** → **Windows Computer** → click **Generate**
5. Copy the 16-character password
6. Paste it into the app during registration or in the Settings panel

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create account, returns JWT |
| POST | `/api/auth/login/` | Login, returns JWT |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get current user |
| PATCH | `/api/auth/profile/` | Update email / Gmail credentials |

### AI & Email
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate-reply/` | Generate 3 AI replies with full analysis |
| POST | `/api/send-email/` | Send email via Gmail SMTP |

### Conversations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations/` | List all threads |
| POST | `/api/conversations/` | Create new thread |
| GET | `/api/conversations/:id/` | Get thread with all messages |
| DELETE | `/api/conversations/:id/` | Delete thread |

### Drafts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/drafts/` | List all drafts |
| POST | `/api/drafts/` | Save new draft |
| PATCH | `/api/drafts/:id/` | Update draft |
| DELETE | `/api/drafts/:id/` | Delete draft |

### History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/history/` | List sent email history |

---

## Generate Reply — Request / Response

**Request** `POST /api/generate-reply/`
```json
{
  "current_email": "Hi, can we reschedule our meeting to Friday?",
  "conversation_id": 1,
  "tone": "professional",
  "length": "medium"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "subject": "Re: Meeting Reschedule",
    "replies": [
      "Hi, Friday works for me. Please confirm the time...",
      "Thank you for reaching out. I'd be happy to reschedule...",
      "Hey! Friday sounds great, totally works for me..."
    ],
    "summary": {
      "key_points": ["Meeting reschedule requested"],
      "action_items": ["Confirm new meeting time"],
      "deadlines": []
    },
    "intent": "Request",
    "emotion": "Neutral",
    "priority": "Medium",
    "suggestions": {
      "attachment": null,
      "follow_up": "Send calendar invite after confirmation",
      "clarification": null
    }
  }
}
```

---

## Database Models

**User** — extends Django AbstractUser with `gmail_address` and `gmail_app_password`

**Conversation** — belongs to a user, has a subject, ordered by latest activity

**Message** — belongs to a conversation, tagged as `user` or `ai`, with timestamp

**Draft** — belongs to a user, stores subject, recipient, content, and tone

**EmailHistory** — immutable log of every sent email with original, reply, tone, recipient

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `SECRET_KEY` | Django secret key |

---

## Security Notes

- Gmail App Passwords are stored server-side and never returned to the frontend
- All endpoints except register and login require a valid JWT
- CORS is configured to allow only the React dev server in development
- For production: set `DEBUG=False`, restrict `ALLOWED_HOSTS`, use PostgreSQL, serve over HTTPS

---

## License

MIT
