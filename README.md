# Zevio — AI Automation Platform for UK Local Businesses

> Built by a non-technical founder. Deployed to production. Serving real paying clients.

**Live at [zevio.co.uk](https://zevio.co.uk)**

---

## What This Is

Zevio removes 3–4 hours of daily manual work from local businesses in the UK.

Restaurants, barbers and salons spend hours every day replying to the same WhatsApp messages, manually responding to Google reviews, and scrambling to keep up with social media. Zevio automates all of it — and goes live within 24 hours of onboarding.

---

## Real Results

| Client | Type | What Zevio handles |
|--------|------|-------------------|
| Damal Restaurant | Restaurant | WhatsApp, reviews, bookings |
| Najma Restaurant | Restaurant | WhatsApp, reviews, social media |
| Star Barbers London | Barber | Appointments, reminders, loyalty |

- Live paying customers from day one
- Businesses go live within 24 hours of onboarding
- 3–4 hours of daily manual work removed per business

---

## What It Does

| Feature | Description |
|---------|-------------|
| WhatsApp Automation | AI replies to customer messages instantly, 24/7 |
| Google Review Management | AI writes professional responses to every review automatically |
| Smart Bookings | Automated confirmations, reminders and deposit requests |
| Social Media Content | AI generates and schedules posts across Instagram, TikTok and Facebook |
| Online Ordering | Commission-free WhatsApp ordering with Stripe payments |
| Staff Management | Automated shift reminders sent directly to staff via WhatsApp |
| Loyalty Programme | Bronze, Silver, Gold tiers with AI-generated reward messages |
| Business Dashboard | Live stats on messages, bookings, reviews and revenue |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/JS |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth |
| Messaging | 360Dialog (WhatsApp Business API) |
| Payments | Stripe (subscriptions + one-time) |
| Email | Resend |
| Edge Functions | Supabase Edge Functions (Deno) |
| Hosting | Vercel |
| Domain | zevio.co.uk (Namecheap) |

---

## Pricing

| Plan | Price | Key Features |
|------|-------|-------------|
| Starter | £197/mo | WhatsApp, reviews, bookings, dashboard |
| Growth | £297/mo | Everything + social media AI + content calendar |
| Pro | £497/mo | Everything + online ordering + Stripe payments + staff management |

---

## Architecture

```
Browser → Vercel (index.html)
             ↓
        Supabase (PostgreSQL + RLS)
             ↓
    Edge Functions (Deno runtime)
         ↙        ↘        ↘
  360Dialog    Stripe    Resend
 (WhatsApp)  (Payments)  (Email)
```

---

## Database Schema

Defined in `supabase/schema.sql`:

- `clients` — business name, type, plan, MRR, Stripe + WhatsApp IDs
- `plans` — Starter, Growth, Pro with features
- `leads` — inbound enquiries from the website
- `messages` — WhatsApp message log per client
- `activity_log` — platform-wide event log

Row Level Security enabled on all tables.

---

## Deployment

Auto-deployed to Vercel on every push to `main`.

```bash
vercel --prod
```

No build step required — pure HTML/CSS/JS frontend.

---

## About the Builder

This platform was built entirely by **Akhyar** — a non-technical founder from Hayes, UK — using Claude Code as an AI coding assistant.

No technical co-founder. No coding bootcamp. Zero to production in under 6 months.

- 🌐 [zevio.co.uk](https://zevio.co.uk)
- 🌐 [me.zevio.co.uk](https://me.zevio.co.uk)
- 📧 akhyar@zevio.co.uk
