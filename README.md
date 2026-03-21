# Zevio — AI Automation Platform for UK Local Businesses

**Live product. Paying clients. Built and shipped solo.**

🌐 [zevio.co.uk](https://zevio.co.uk)

---

## What It Is

Zevio removes 3–4 hours of daily manual work from UK restaurants, barbers and salons.

Business owners waste hours every day replying to WhatsApp messages, responding to Google reviews, and trying to keep up with social media — on top of running their business. Zevio automates all of it and goes live within 24 hours.

---

## Real Results

| Client | Type | What Zevio handles |
|--------|------|-------------------|
| Damal Restaurant, London | Restaurant | WhatsApp, reviews, bookings |
| Najma Restaurant, London | Restaurant | WhatsApp, reviews, social media |
| Star Barbers, Hayes | Barber | Appointments, reminders, loyalty |

- 3–4 hours of daily manual work removed per business
- Google ratings improved from 4.1 → 4.7 within 2 months
- No-show rates cut significantly through automated deposit collection
- Businesses live within 24 hours of onboarding

---

## Features

| Feature | What it does |
|---------|-------------|
| WhatsApp Automation | AI replies to every customer message instantly, 24/7 |
| Google Review Management | AI writes professional responses to every review automatically |
| Smart Bookings | Confirmations, deposit requests and reminders sent automatically |
| Social Media Content | AI generates a full month of posts in one click |
| Online Ordering | Commission-free WhatsApp ordering with Stripe payments |
| Staff Management | Automated shift reminders sent to each staff member via WhatsApp |
| Loyalty Programme | Bronze, Silver, Gold tiers with AI-generated reward messages |
| Business Dashboard | Live stats on messages, bookings, reviews and revenue |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth |
| Backend | Supabase Edge Functions (Deno / TypeScript) |
| Messaging | WhatsApp Business API (360Dialog) |
| Payments | Stripe |
| Email | Resend (transactional + automated sequences) |
| Hosting | Vercel |

---

## Architecture

```
Browser → Vercel (static HTML/JS)
               ↓
     Supabase Edge Functions (Deno)
          ↙         ↘         ↘
   WhatsApp API   Stripe    Resend
   (360Dialog)  (Payments)  (Email)
          ↓
   Supabase Postgres (RLS on all tables)
```

**Edge functions:**
- `submit-lead` — captures enquiries, instantly sends welcome email, queues 4-email follow-up sequence
- `send-followup` — processes email queue (runs hourly)
- `ai-generate` — AI content generation for reviews, social posts and WhatsApp replies
- `admin` — internal operations

**Database tables:**
- `leads` — inbound enquiries with status tracking
- `email_queue` — scheduled follow-up emails
- `clients` — business accounts with plan and Stripe IDs
- `messages` — WhatsApp message log per client

---

## Pricing

| Plan | Price | Includes |
|------|-------|---------|
| Starter | £197/mo | WhatsApp AI, review responses, bookings, dashboard |
| Growth | £297/mo | Starter + social media AI + 30-day content calendar + loyalty |
| Pro | £497/mo | Growth + online ordering + Stripe payments + staff management |

Setup included on all plans. No long-term contracts.

---

## Deployment

Auto-deployed to Vercel on push to `main`. No build step — pure HTML/CSS/JS frontend.

Supabase edge functions deployed via Supabase CLI:
```bash
supabase functions deploy submit-lead
supabase functions deploy send-followup
```

---

## About

Built by **Akhyar** — founder and sole builder.

Identified the problem, designed the solution, built the full stack, acquired paying clients and shipped to production. Zevio is a live, revenue-generating business.

- 🌐 [zevio.co.uk](https://zevio.co.uk)
- 📧 akhyar@zevio.co.uk
- 📞 +44 7877 262518
