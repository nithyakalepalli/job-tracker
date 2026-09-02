# Job Application Tracker

A full-stack web app for tracking job applications — company, role, status, and notes — with a live dashboard summarizing progress. I built this as my first full-stack project while job searching, both to solve a real problem (keeping track of my own applications) and to learn how the pieces of a full-stack app fit together end to end.

**Live app:** https://job-tracker-dusky-eight-89.vercel.app/
**API:** https://job-tracker-api-a910.onrender.com/docs

## What it does

- Add, edit, and delete job applications (company, role, date applied, posting link, notes)
- Track each application through a status pipeline: Applied → Screening → Interview → Offer / Rejected
- Filter and search applications by company or status
- Dashboard showing total applications, response rate, and a breakdown by status

## Tech stack

**Frontend:** React (Vite), plain CSS
**Backend:** FastAPI (Python), SQLAlchemy
**Database:** PostgreSQL
**Deployment:** Vercel (frontend), Render (backend + database)

## Architecture notes

- **Separate frontend and backend.** The React app and FastAPI service are deployed independently and communicate over HTTP. This keeps the API reusable (e.g., a mobile app could hit the same endpoints) and made local development straightforward — I could work on either side without touching the other.
- **PATCH vs. PUT.** The API supports both: `PUT` replaces an application's full set of fields, while `PATCH` updates only the fields provided (e.g., changing just the status without resending everything else). This matches how the UI actually uses it — status updates only ever touch one field.
- **Environment variables for config.** Both the database connection string and the frontend's API URL are read from environment variables rather than hardcoded, so the same code runs against local Postgres/localhost in development and the live database/API in production without any code changes.
- **Filtering happens server-side.** The `/applications` endpoint accepts optional `status` and `company` query parameters, so filtering logic lives in one place (the API) rather than being duplicated on the frontend.

## What I'd add next

- User accounts/authentication, so the app supports more than one user
- A browser extension to auto-capture job postings into the tracker
- Email reminders for applications with no response after N days

## Running it locally

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\Activate   # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
# create a .env file with DATABASE_URL=postgresql://...
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
# create a .env file with VITE_API_URL=http://127.0.0.1:8000
npm run dev
```
