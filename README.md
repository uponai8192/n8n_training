# N8N + RetellAI Exercise Platform

A training platform for learning n8n automation with RetellAI AI phone agents. Partners work through 10 progressive exercises, from basic webhooks to production-grade automation systems.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env` and update:

```bash
cp .env .env.local
```

Key variables:
- `NEXTAUTH_SECRET` — Change to a strong random string (32+ chars)
- `NEXTAUTH_URL` — Your deployment URL (e.g. `http://localhost:3000`)
- `ADMIN_EMAIL` — Your admin email
- `ADMIN_PASSWORD` — Your initial admin password

### 3. Set up database

```bash
npx prisma migrate dev
node prisma/seed.cjs
```

This creates the SQLite database and seeds:
- 1 admin account (credentials from `.env`)
- 10 progressive exercises

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Roles

### Admin
- Login at `/login` with your admin credentials
- Dashboard at `/admin` shows all partner progress
- Invite partners at `/admin/invites`
- View all partners at `/admin/partners`

### Partners
- Register via invite link from admin
- Work through exercises at `/dashboard`
- Complete exercises in any order
- Track progress at `/dashboard/progress`

## Exercises

| # | Title | Difficulty |
|---|-------|-----------|
| 1 | Your First Webhook | Beginner |
| 2 | Receiving RetellAI Call Events | Beginner |
| 3 | Conditional Routing with IF Nodes | Beginner |
| 4 | Sending Notifications After Calls | Intermediate |
| 5 | Logging Call Data to Google Sheets | Intermediate |
| 6 | Calling External APIs & CRM Updates | Intermediate |
| 7 | AI-Powered Transcript Analysis | Advanced |
| 8 | Error Handling & Retry Logic | Advanced |
| 9 | Dynamic RetellAI Agent Updates | Advanced |
| 10 | Production-Ready RetellAI Platform | Expert |

## Database

Uses SQLite with Prisma ORM. Database file: `dev.db`

```bash
npm run db:seed       # Reseed exercises
npm run db:studio     # Open Prisma Studio
npm run db:push       # Push schema changes
```

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** — Styling
- **Prisma 7** + **SQLite** — Database
- **NextAuth v4** — Authentication
- **better-sqlite3** — SQLite driver adapter
