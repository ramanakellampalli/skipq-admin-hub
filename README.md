# SkipQ — Admin Hub

> Platform oversight. One dashboard.

The internal admin dashboard for SkipQ. Monitor live order activity, manage campuses and vendors, and track platform revenue — all from a single sync call.

Built with **React + Vite**, styled with **shadcn/ui** and **Tailwind CSS**.

---

## Features

- **Dashboard** — today's order count, active vendors, orders in progress, revenue at a glance
- **Campus management** — add new campuses with their affiliated email domain
- **Vendor management** — create vendor accounts, trigger onboarding invite
- **Order overview** — all orders across the platform with item-level breakdown
- **Single sync model** — one API call loads everything into a Zustand store; no per-page fetches

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand |
| API | Axios + Vite env vars |

---

## Getting Started

### Prerequisites

- Node 22+

### Install

```bash
git clone https://github.com/ramanakellampalli/skipq-admin-hub.git
cd skipq-admin-hub
npm install
```

### Environment

Create a `.env.local` file in the project root (gitignored):

```env
VITE_API_URL=https://skipq-core-dev-obh3j3jqpa-el.a.run.app
```

### Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

---

## Dev Testing

### Login

Admin accounts are seeded directly in the database. Contact the platform owner for dev credentials.

### Create a test vendor (dev)

When the backend is running in dev mode (`otp.bypass=true`), vendor accounts are ready to use immediately — no invite email is sent.

1. Log into the Admin Hub
2. Go to **Vendors → Create Vendor**
3. Select a campus, fill in vendor and owner details
4. The vendor can log into the **Vendor Hub** immediately:

| Field | Value |
|-------|-------|
| Email | The email you entered |
| Password | `Test@1234` |

### Create a campus

1. Go to **Campuses → Add Campus**
2. Enter campus name (e.g. `SRM AP`) and email domain (e.g. `srmap.edu.in`)
3. Students registering with that domain are now automatically linked to this campus

---

## How It Works

On login, a single `GET /api/v1/admin/sync` call returns:

```json
{
  "stats": { "totalOrders": 42, "activeVendors": 3, "inProgress": 7, "revenue": 1840.00 },
  "campuses": [...],
  "vendors": [...],
  "orders": [...]
}
```

Everything is stored in a Zustand store. All pages read from the store — no extra network calls on navigation.

Creating a vendor (`POST /api/v1/admin/vendors`) in production sends the owner a deep link email:

```
skipq://vendor/setup?token=xxx
```

The vendor taps this link on their Android device to set their password and activate their account.

---

## Project Structure

```
src/
├── components/     # shadcn/ui components + custom UI
├── lib/
│   └── api.ts      # Axios client (reads VITE_API_URL)
├── pages/          # Dashboard, Vendors, Campuses, Orders
├── store/          # Zustand: authStore, adminStore
└── types/          # Shared TypeScript types
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (dev or prod) |

Managed via Vite's built-in env system. Use `.env.local` for local overrides (gitignored).
