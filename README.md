# SpendWise — Personal Expense Tracker

A full-stack personal expense tracking application with authentication, budgets, analytics, and data backup/restore.

**Frontend**: React + Vite + TailwindCSS → Deployed on **Vercel**  
**Backend**: Python FastAPI + SQLAlchemy → Deployed on **Render**  
**Database**: MySQL (Aiven) with SSL

---

## Features

- 🔐 **Authentication** — Register, login, JWT access/refresh tokens, secure cookies
- 💰 **Transactions** — Add, edit, delete income & expenses with categories
- 📊 **Analytics** — Monthly trends, category breakdowns, income vs expense summaries
- 🎯 **Budgets** — Set monthly limits per category with progress tracking
- 💾 **Backup & Restore** — Export/import your financial data
- 🌙 **Dark Mode** — System-aware theme with manual toggle
- 📱 **Responsive** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Frontend   | React 19, Vite 8, TailwindCSS 4, Recharts |
| Backend    | Python, FastAPI, SQLAlchemy (async), Alembic |
| Database   | MySQL (Aiven cloud)                      |
| Auth       | JWT (access + refresh), Argon2 hashing   |
| Deployment | Vercel (frontend), Render (backend)      |

---

## Project Structure

```
Personal-expense-tracker/
├── src/                    # React frontend
│   ├── api/                # Axios API client
│   ├── auth/               # Auth context & protected routes
│   ├── components/         # Reusable UI components
│   ├── hooks/              # React hooks (expenses, theme)
│   ├── pages/              # Page components
│   └── App.jsx             # App root with routing
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes & dependencies
│   │   ├── core/           # Config & security
│   │   ├── db/             # Database models & connection
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI app entry point
│   ├── alembic/            # Database migrations
│   ├── certs/              # SSL certificates (gitignored)
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── vercel.json             # Vercel deployment config
├── render.yaml             # Render deployment config
└── .env.example            # Environment variables template
```

---

## Local Development Setup

### Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **MySQL** database (local or Aiven cloud)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/Personal-expense-tracker.git
cd Personal-expense-tracker

# Frontend dependencies
npm install

# Backend dependencies
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Root (frontend)
cp .env.example .env

# Backend
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:

```env
DATABASE_URL="mysql+asyncmy://user:password@host:port/database"
JWT_SECRET_KEY="your-generated-secret-key"
DATABASE_SSL_REQUIRED=true
DATABASE_CA_CERT="./certs/ca.pem"
```

> **Generate a JWT secret**: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### 3. SSL Certificate (for Aiven)

Download the CA certificate from your Aiven dashboard and save it as:

```
backend/certs/ca.pem
```

### 4. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

### 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — Frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Production Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the **Framework Preset** to **Vite**
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
5. Deploy

After deploying, update `vercel.json` → rewrites → API destination URL with your actual Render backend URL.

### Backend → Render

1. Connect your GitHub repo to [Render](https://render.com)
2. Create a new **Web Service**
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in Render dashboard:

| Variable | Value |
|----------|-------|
| `APP_ENV` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | `mysql+asyncmy://avnadmin:...@host:port/defaultdb` |
| `DATABASE_SSL_REQUIRED` | `true` |
| `JWT_SECRET_KEY` | *(generate a strong random key)* |
| `FRONTEND_ORIGIN` | `https://your-app.vercel.app` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |

### Database → Aiven MySQL

1. Create a free MySQL service at [Aiven](https://aiven.io)
2. Copy the connection details (host, port, user, password)
3. Download the CA certificate
4. Set `DATABASE_URL` in both local `.env` and Render environment variables

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout and clear tokens |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/transactions` | List all transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/{id}` | Update a transaction |
| DELETE | `/api/transactions/{id}` | Delete a transaction |
| GET | `/api/budgets` | List all budgets |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/{id}` | Update a budget |
| DELETE | `/api/budgets/{id}` | Delete a budget |
| GET | `/api/analytics/summary` | Income/expense summary |
| GET | `/api/analytics/monthly` | Monthly trends |
| GET | `/api/analytics/categories` | Spending by category |
| POST | `/api/backup/import` | Import backup data |
| DELETE | `/api/data` | Clear all user data |
| GET | `/api/health` | Health check |
| GET | `/api/health/db` | Database health check |

---

## License

MIT
