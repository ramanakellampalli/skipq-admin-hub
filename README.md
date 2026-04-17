# skipq-admin-hub

Admin dashboard for SkipQ — manage vendors, monitor orders, and view platform stats. Built with React, Vite, and shadcn/ui.

## Stack

- React 18 + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- Zustand (state management)
- Axios

## Features

- **Dashboard** — today's order count, active vendors, orders in progress, revenue
- **Vendors** — list all vendors, create new vendor (triggers setup invite email)
- **Orders** — view all orders across the platform with item breakdown

## How it works

On login, a single `GET /api/v1/admin/sync` call loads everything (stats, vendors, orders) into a Zustand store. All pages read from the store — no per-page API calls.

Creating a vendor sends the owner a deep link email (`skipq://vendor/setup?token=xxx`) to set up their password and activate their account on the vendor app.

## Local development

```bash
npm install
npm run dev
```

Connects to the production backend by default. Update `src/lib/api.ts` to point to a local backend if needed.

## Login

Admin accounts only. Logging in with a non-admin account is blocked at the UI level. Admin users are seeded directly in the database.
