# Zevio — AI Automation Platform

Zevio is a SaaS platform that delivers AI-powered automation to UK local businesses — including WhatsApp messaging, review management, and client analytics — all managed through a clean, real-time dashboard.

## Live Platform

[zevio.co.uk](https://zevio.co.uk)

## What It Does

- **WhatsApp Automation** — AI-powered messaging via 360Dialog for client businesses
- **Client Management** — Track clients, plans, MRR, and statuses in one place
- **Billing** — Stripe-powered subscription management (Growth / Pro / Enterprise)
- **Real-time Dashboard** — Live stats on revenue, active clients, and platform health

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (single-file SPA) |
| Auth & Database | Supabase (PostgreSQL + RLS) |
| Messaging | 360Dialog (WhatsApp Business API) |
| Payments | Stripe |
| Hosting | Vercel |
| Domain | Namecheap → zevio.co.uk |

## Plans

| Plan | Price/mo |
|------|----------|
| Growth | £297 |
| Pro | £497 |
| Enterprise | £997 |

## Database Schema

Defined in `supabase/schema.sql`:

- `clients` — business name, type, plan, MRR, status, WhatsApp/Stripe IDs
- `plans` — Growth, Pro, Enterprise with features
- `messages` — WhatsApp message log per client
- `activity_log` — platform event log

Row Level Security is enabled on all tables — only authenticated users can read or write.

## Deployment

Deployed automatically to Vercel on every push to `main`.

```bash
# Deploy manually
vercel --prod
```

## Local Development

No build step required — open `index.html` directly in a browser or serve with any static server.

```bash
npx serve .
```

## Environment

Supabase credentials are embedded as a publishable key in `index.html` (safe for client-side use). No `.env` file needed for the frontend.
