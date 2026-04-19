<p align="center">
  <h1 align="center">⚡ SkipQ — Admin Hub</h1>
  <p align="center">Platform oversight. One dashboard.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Tailwind-000000?style=for-the-badge" />
</p>

---

## What is SkipQ?

SkipQ is a campus food ordering platform. This is the **internal admin dashboard** — the control plane for the entire platform.

---

## Features

| | |
|---|---|
| 📊 **Live dashboard** | Today's orders, active vendors, in-progress count, revenue |
| 🏫 **Campus management** | Add campuses with their affiliated email domain |
| 🏪 **Vendor management** | Create vendor accounts, trigger onboarding invite |
| 🧾 **Order overview** | All orders across the platform with item-level breakdown |
| ⚡ **Single sync model** | One API call loads everything — no per-page fetches |

---

## How It Works

On login, a single `GET /api/v1/admin/sync` call returns the entire platform state:

```json
{
  "stats":    { "totalOrders": 42, "activeVendors": 3, "inProgress": 7, "revenue": 1840.00 },
  "campuses": [...],
  "vendors":  [...],
  "orders":   [...]
}
```

Everything goes into a **Zustand store**. All pages read from the store — navigation is instant, zero extra network calls.

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

Create `.env.local` in the project root (gitignored):

```env
VITE_API_URL=https://skipq-core-dev-obh3j3jqpa-el.a.run.app
```

### Run

```bash
npm run dev
# → http://localhost:5173
```

---

## Dev Testing

### ✅ Create a test vendor (dev backend)

When the backend runs in dev mode, vendor accounts are ready immediately — no invite email sent.

1. Log into the Admin Hub
2. **Vendors → Create Vendor** → fill in details, use any email
3. Vendor logs into the **Vendor Hub** with:

| Field | Value |
|-------|-------|
| Email | The email you entered |
| Password | `Test@1234` |

### ✅ Add a campus

1. **Campuses → Add Campus**
2. Enter name (e.g. `SRM AP`) and email domain (e.g. `srmap.edu.in`)
3. Students registering with that domain are auto-linked to this campus

### Vendor onboarding (prod)

Creating a vendor sends an invite email with a deep link:

```
skipq://vendor/setup?token=xxx
```

The vendor taps this on their Android device → sets password + business details → activated.

---

## Project Structure

```
src/
├── components/     # shadcn/ui components + custom UI
├── lib/
│   └── api.ts      # Axios client — reads VITE_API_URL
├── pages/          # Dashboard, Vendors, Campuses, Orders
├── store/          # Zustand: authStore, adminStore
└── types/          # Shared TypeScript types
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL |

Managed via Vite's built-in env system. Use `.env.local` for local overrides (gitignored).

---

> Admin accounts are seeded directly in the database. Contact the platform owner for access.
