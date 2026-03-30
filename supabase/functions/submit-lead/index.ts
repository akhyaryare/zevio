import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function hours(n: number) {
  return new Date(Date.now() + n * 60 * 60 * 1000).toISOString()
}

function email1(name: string, email: string) {
  const first = name.split(' ')[0]
  return {
    to_email: email,
    sequence: 1,
    send_after: new Date().toISOString(),
    subject: `Thanks ${first} — I'll be in touch within 24 hours`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
  <h2 style="font-size:22px;margin-bottom:12px">Hi ${first}, thanks for reaching out.</h2>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:12px">
    I've received your enquiry and will personally be in touch within 24 hours to book a free demo and show you exactly how Zevio works for your business.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:8px"><strong>What happens next:</strong></p>
  <ul style="font-size:15px;line-height:2;color:#444;padding-left:20px">
    <li>📞 I'll WhatsApp or call you to book a quick 20-minute demo</li>
    <li>🎯 We look at your specific business and show live results</li>
    <li>🚀 If it's a fit, we set everything up for you — you don't touch a thing</li>
  </ul>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:16px">
    Talk soon,<br/><strong>Akhyar</strong><br/>Founder, Zevio<br/>
    <a href="tel:+447877262518">+44 7877 262518</a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Zevio · AI Automation for Local Businesses · <a href="https://zevio.co.uk">zevio.co.uk</a></p>
</div>`
  }
}

function email2(name: string, email: string) {
  const first = name.split(' ')[0]
  return {
    to_email: email,
    sequence: 2,
    send_after: hours(24),
    subject: `${first}, here's what Zevio actually does for your business`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
  <h2 style="font-size:22px;margin-bottom:12px">Here's what Zevio handles for you — every single day.</h2>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    Most business owners waste 3–4 hours a day on things Zevio can do in seconds. Here's what your typical day looks like once you're set up:
  </p>

  <div style="background:#f9f9f9;border-left:4px solid #5B3FD4;padding:16px;margin-bottom:12px;border-radius:0 4px 4px 0">
    <strong>💬 WhatsApp — handled</strong><br/>
    <span style="font-size:14px;color:#555">Every booking request, menu question, and complaint gets an instant AI reply. Customers never wait. You never get distracted.</span>
  </div>

  <div style="background:#f9f9f9;border-left:4px solid #5B3FD4;padding:16px;margin-bottom:12px;border-radius:0 4px 4px 0">
    <strong>⭐ Google Reviews — protected</strong><br/>
    <span style="font-size:14px;color:#555">AI writes personalised, professional responses to every review — 5-star or 1-star. Your reputation stays spotless.</span>
  </div>

  <div style="background:#f9f9f9;border-left:4px solid #5B3FD4;padding:16px;margin-bottom:12px;border-radius:0 4px 4px 0">
    <strong>📱 Social Media — on autopilot</strong><br/>
    <span style="font-size:14px;color:#555">A full month of captions, posts and content ideas — generated in minutes. Your social presence grows without you lifting a finger.</span>
  </div>

  <div style="background:#f9f9f9;border-left:4px solid #5B3FD4;padding:16px;margin-bottom:12px;border-radius:0 4px 4px 0">
    <strong>📅 Bookings — confirmed automatically</strong><br/>
    <span style="font-size:14px;color:#555">Customers book via WhatsApp. Deposits collected automatically. Reminders sent. No-shows cut by up to 80%.</span>
  </div>

  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:20px">
    If this sounds like something your business needs, let's get on a call.
  </p>
  <a href="https://zevio.co.uk/#contact" style="display:inline-block;background:#5B3FD4;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:700;margin-top:8px">Book your free demo →</a>
  <p style="font-size:14px;color:#777;margin-top:16px">— Akhyar, Founder · <a href="tel:+447877262518">+44 7877 262518</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Zevio · <a href="https://zevio.co.uk">zevio.co.uk</a> · <a href="mailto:akhyar@zevio.co.uk">Unsubscribe</a></p>
</div>`
  }
}

function email3(name: string, email: string) {
  const first = name.split(' ')[0]
  return {
    to_email: email,
    sequence: 3,
    send_after: hours(72),
    subject: `Quick question, ${first}`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
  <p style="font-size:15px;line-height:1.7;color:#444">Hi ${first},</p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    I just wanted to check in — I know running a business is hectic and things get lost.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    I have one quick question: <strong>what's the single biggest time drain in your business right now?</strong>
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    Is it:
  </p>
  <ul style="font-size:15px;line-height:2;color:#444;padding-left:20px">
    <li>Replying to the same WhatsApp messages over and over?</li>
    <li>Dealing with Google reviews?</li>
    <li>Trying to keep up with social media?</li>
    <li>Chasing no-shows and unpaid deposits?</li>
  </ul>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:16px">
    Just reply to this email and tell me — I'll show you exactly how Zevio fixes it.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:16px">
    — Akhyar<br/>
    <a href="tel:+447877262518">+44 7877 262518</a> · <a href="mailto:akhyar@zevio.co.uk">akhyar@zevio.co.uk</a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Zevio · <a href="https://zevio.co.uk">zevio.co.uk</a> · <a href="mailto:akhyar@zevio.co.uk">Unsubscribe</a></p>
</div>`
  }
}

function email4(name: string, email: string) {
  const first = name.split(' ')[0]
  return {
    to_email: email,
    sequence: 4,
    send_after: hours(168),
    subject: `${first} — last thing from me`,
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
  <p style="font-size:15px;line-height:1.7;color:#444">Hi ${first},</p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    I won't keep chasing — I promise this is the last email.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    I just want to leave you with this: the businesses we work with save <strong>10–15 hours every week</strong> on messaging, reviews and social media. That's time back in your life.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    Our current clients are paying £297–£497/month for that. We only take on a small number of businesses each month so we can give each one proper attention.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:16px">
    If you're ready when the time is right, I'm here.
  </p>
  <a href="https://zevio.co.uk/#contact" style="display:inline-block;background:#5B3FD4;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:700;margin-top:8px">Book a demo whenever you're ready →</a>
  <p style="font-size:14px;color:#777;margin-top:20px">— Akhyar, Founder · Zevio</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Zevio · <a href="https://zevio.co.uk">zevio.co.uk</a> · <a href="mailto:akhyar@zevio.co.uk">Unsubscribe</a></p>
</div>`
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { name, email, phone, business_name, business_type, plan, message } = await req.json()

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Save lead
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({ name, email, phone, business_name, business_type, plan, message })
      .select()
      .single()

    if (dbError) throw dbError

    // Queue 4-email sequence
    const emails = [
      email1(name, email),
      email2(name, email),
      email3(name, email),
      email4(name, email),
    ].map(e => ({ ...e, lead_id: lead.id }))

    await supabase.from('email_queue').insert(emails)

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (RESEND_API_KEY) {
      const first = name.split(' ')[0]
      const isGuide = business_type === 'guide'

      const welcomeSubject = isGuide
        ? `${first}, here's your free guide`
        : `Thanks ${first} — I'll be in touch within 24 hours`

      const welcomeHtml = isGuide ? `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
  <h2 style="font-size:22px;margin-bottom:12px">Hi ${first}, here's your free guide.</h2>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:20px">
    As promised — a plain-English breakdown of how UK restaurants and local businesses save 10+ hours a week using automation.
  </p>
  <div style="text-align:center;margin:28px 0">
    <a href="https://d2xsxph8kpxj0f.cloudfront.net/310519663441971387/bNPBmJQSAsJk8e4oxFv6MX/5_hours_saved_guide_6cda5000.pdf"
       style="display:inline-block;background:#5331cf;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px">
      Download your free guide →
    </a>
  </div>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:12px"><strong>What's inside:</strong></p>
  <ul style="font-size:15px;line-height:2;color:#444;padding-left:20px">
    <li>The 5 automations that save the most time</li>
    <li>How WhatsApp automation works (and what it replies)</li>
    <li>How to stop losing bookings to slow responses</li>
    <li>Real results from UK restaurants using these systems</li>
  </ul>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:20px">
    If you want to see it set up for your specific business — I do a free 20-minute walkthrough. No pressure, just clarity.
  </p>
  <a href="https://zevio.co.uk/#waitlist"
     style="display:inline-block;background:#f2f3fc;color:#5331cf;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin-top:8px;border:1.5px solid #c9beff">
    Book a free walkthrough
  </a>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:24px">
    — Akhyar<br/>Founder, Zevio<br/>
    <a href="tel:+447877262518">+44 7877 262518</a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Zevio · AI Automation for Local Businesses · <a href="https://zevio.co.uk">zevio.co.uk</a></p>
</div>` : `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;padding:24px">
  <h2 style="font-size:22px;margin-bottom:12px">Hi ${first}, thanks for reaching out.</h2>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:12px">
    I've received your enquiry and will personally be in touch within 24 hours to book a free 20-minute demo and show you exactly how Zevio works for your business.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-bottom:8px"><strong>What happens next:</strong></p>
  <ul style="font-size:15px;line-height:2;color:#444;padding-left:20px">
    <li>I'll WhatsApp or call you to book a quick demo</li>
    <li>We look at your specific business and show you live results</li>
    <li>If it's a fit, I set everything up for you — you don't touch a thing</li>
  </ul>
  <p style="font-size:15px;line-height:1.7;color:#444;margin-top:16px">
    Talk soon,<br/><strong>Akhyar</strong><br/>Founder, Zevio<br/>
    <a href="tel:+447877262518">+44 7877 262518</a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Zevio · AI Automation for Local Businesses · <a href="https://zevio.co.uk">zevio.co.uk</a></p>
</div>`

      // Welcome / guide email to the customer
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Akhyar at Zevio <akhyar@zevio.co.uk>',
          to: [email],
          subject: welcomeSubject,
          html: welcomeHtml,
        })
      })

      // Notify Akhyar
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Zevio <akhyar@zevio.co.uk>',
          to: ['abdisamadahmed114@gmail.com'],
          subject: isGuide ? `📥 Guide download: ${name} — ${email}` : `🔥 New lead: ${name} — ${business_type || 'Unknown'} — ${plan || 'No plan'}`,
          html: `
<div style="font-family:sans-serif;padding:24px;max-width:560px">
  <h2 style="color:#5B3FD4">New lead from zevio.co.uk</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Name</td><td style="padding:8px;border:1px solid #eee">${name}</td></tr>
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Email</td><td style="padding:8px;border:1px solid #eee">${email}</td></tr>
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Phone</td><td style="padding:8px;border:1px solid #eee">${phone || '—'}</td></tr>
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Business</td><td style="padding:8px;border:1px solid #eee">${business_name || '—'}</td></tr>
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Type</td><td style="padding:8px;border:1px solid #eee">${business_type || '—'}</td></tr>
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Plan</td><td style="padding:8px;border:1px solid #eee">${plan || '—'}</td></tr>
    <tr><td style="padding:8px;border:1px solid #eee;font-weight:700">Message</td><td style="padding:8px;border:1px solid #eee">${message || '—'}</td></tr>
  </table>
  <p style="margin-top:16px;font-size:13px;color:#777">Email sequence queued: 4 emails over 7 days.</p>
</div>`
        })
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
