# Zevio — AI Automation Platform for UK Local Businesses

**Live product. Paying clients. Built and shipped solo.**

🌐 [zevio.co.uk](https://zevio.co.uk)

---

## The Problem It Solves

UK restaurant and salon owners were drowning in manual work every single day — while trying to actually run their business.

**Before Zevio:**

| Problem | Impact |
|---------|--------|
| 30–50 WhatsApp messages replied to manually every morning | 2–3 hours lost before service even starts |
| Bookings confirmed late or missed entirely | Customers went to competitors |
| Google reviews left unanswered | Rating slowly dropped, reputation damaged |
| Social media ignored — no time or consistency | Invisible online while competitors grew |
| No deposit system — tables booked and never showed | Direct revenue lost every week |

**After Zevio:**

| What changed | Result |
|-------------|--------|
| Every WhatsApp message answered instantly, 24/7 | Zero manual effort on messages |
| Bookings confirmed automatically with deposits collected | No-show rates cut significantly |
| Every review responded to professionally | Rating improved from 4.1 → 4.7 within 2 months |
| A full month of social content generated in one click | Consistent online presence without effort |
| Business owner out of the daily grind | 3–5 hours saved per day |

**Live clients:** Damal Restaurant · Najma Restaurant · Star Barbers London — all live within 24 hours of onboarding.

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
