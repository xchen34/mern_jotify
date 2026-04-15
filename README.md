# Jotify

Live demo: https://jotify.onrender.com  
Note: the first load may take ~30 seconds due to cold start (Render), then it should work normally.

A MERN (MongoDB + Express + React + Node.js) note-taking app with:
- Email/password auth + Google sign-in
- Guest/demo mode (try core features without creating an account)
- JWT access/refresh token flow (refresh token stored in `httpOnly` cookie)
- Rate limiting + basic production security headers

## Tech Stack

- Frontend: React + Vite, TailwindCSS + DaisyUI, Axios, React Router
- Backend: Node.js, Express, MongoDB/Mongoose
- Auth: bcrypt password hashing, JWT access/refresh tokens, Google Identity (ID token verification)
- Security/ops: Helmet (CSP in prod), CORS allowlist, Upstash rate limiting (optional), Nodemailer (optional)

## Features

- Notes CRUD with per-user isolation (a user can only access their own notes)
- Guest mode:
  - one-click guest login
  - guest notes auto-expire (TTL) and guest accounts are limited (to encourage signup)
- Authentication:
  - signup/login with bcrypt hashing
  - Google sign-in (Google Identity Services)
  - access token (short-lived) + refresh token (long-lived)
  - refresh token stored in an `httpOnly` cookie; frontend auto-refreshes access tokens via an Axios interceptor
- Profile:
  - get/update profile (guests are blocked)
  - forgot/reset password (email delivery is best-effort; requires SMTP config)

## Project Structure

```
.
├── backend/        # Express API + MongoDB
└── frontend/       # React (Vite) client
```

In production, the backend serves the built frontend from `frontend/dist`.

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local MongoDB or MongoDB Atlas)

### 1) Install dependencies

From the repo root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2) Configure environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill at least:
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` (recommended for dev: `http://localhost:5173`)

Frontend:

Create one (or both) of the following:
- `frontend/.env.development` (local dev)
- `frontend/.env.production` (production build)

Use the example files:
- `frontend/.env.development.example`
- `frontend/.env.production.example`

At minimum set:
- `VITE_GOOGLE_CLIENT_ID`

Notes:
- The backend also needs `GOOGLE_CLIENT_ID` (used to verify Google ID tokens).
- Never put `GOOGLE_CLIENT_SECRET` in the frontend. The frontend only needs the Client ID.

### 3) Run in development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Production (single server)

Build frontend and start backend in production mode:

```bash
npm run build
npm run start
```

This will:
- build the frontend into `frontend/dist`
- serve `frontend/dist` from the backend (same origin)
- enable production security behavior (`NODE_ENV=production`)

## API Overview

Base URL:
- Dev: `http://localhost:5001/api`
- Prod: `/api`

Auth (`/api/auth/*`):
- `POST /guest` — guest login (returns access token + sets refresh cookie)
- `POST /signup` — email/password signup
- `POST /login` — email/password login
- `POST /google` — Google sign-in (expects `{ credential: "<google_id_token>" }`)
- `POST /refresh` — rotates refresh cookie and returns a new access token
- `POST /logout` — clears refresh cookie
- `GET /profile` — current user profile (requires auth)
- `PUT /profile` — update profile (requires auth)
- `POST /forgot-password` — request password reset email (best-effort)
- `POST /reset-password` — reset password using token

Notes (`/api/notes/*`, requires auth):
- `GET /` — list notes
- `GET /:id` — get a note
- `POST /` — create note
- `PUT /:id` — update note
- `DELETE /:id` — delete note

## Google Login Setup (OAuth / Google Identity)

In Google Cloud Console, add **Authorized JavaScript origins** for your client ID:
- Dev: `http://localhost:5173`
- Prod: your production origin (must be HTTPS)

Common error:
- `The given origin is not allowed for the given client ID`
  - Fix: add the exact origin (scheme + host + port) you are visiting.

## License

Personal project. Add a license if you plan to open-source it.
