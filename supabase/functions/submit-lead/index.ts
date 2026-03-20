import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Save lead to database
    const { error: dbError } = await supabase.from('leads').insert({
      name, email, phone, business_name, business_type, plan, message
    })

    if (dbError) throw dbError

    // Send notification email to Akhyar via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Zevio Leads <leads@zevio.co.uk>',
          to: ['akhyar@zevio.co.uk'],
          subject: `New lead: ${name} — ${business_type || 'Business'} — ${plan || 'No plan selected'}`,
          html: `
            <h2>New Zevio Lead 🎉</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Name</strong></td><td style="padding:8px;border:1px solid #eee">${name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Email</strong></td><td style="padding:8px;border:1px solid #eee">${email}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #eee">${phone || '—'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Business</strong></td><td style="padding:8px;border:1px solid #eee">${business_name || '—'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Type</strong></td><td style="padding:8px;border:1px solid #eee">${business_type || '—'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Plan</strong></td><td style="padding:8px;border:1px solid #eee">${plan || '—'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee"><strong>Message</strong></td><td style="padding:8px;border:1px solid #eee">${message || '—'}</td></tr>
            </table>
            <p style="margin-top:16px"><a href="https://zevio.co.uk/app" style="background:#5B3FD4;color:white;padding:10px 20px;text-decoration:none;border-radius:4px">View in Dashboard</a></p>
          `
        })
      })

      // Send welcome email to the lead
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Akhyar at Zevio <akhyar@zevio.co.uk>',
          to: [email],
          subject: `Thanks ${name.split(' ')[0]} — we'll be in touch shortly`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
              <img src="https://zevio.co.uk/logo.png" alt="Zevio" style="height:36px;margin-bottom:24px" />
              <h2 style="font-size:24px;margin-bottom:12px">Hi ${name.split(' ')[0]}, thanks for reaching out.</h2>
              <p style="font-size:16px;line-height:1.7;color:#444">
                I've received your enquiry and I'll personally be in touch within 24 hours to book a free demo and show you exactly how Zevio can automate your business.
              </p>
              <p style="font-size:16px;line-height:1.7;color:#444">
                In the meantime, here's what happens next:
              </p>
              <ul style="font-size:15px;line-height:2;color:#444">
                <li>📞 I'll call or WhatsApp you to book a quick 20-minute demo</li>
                <li>🎯 We'll look at your specific business and show you live results</li>
                <li>🚀 If it's a fit, we set everything up for you — you don't touch a thing</li>
              </ul>
              <p style="font-size:16px;line-height:1.7;color:#444">
                Talk soon,<br/>
                <strong>Akhyar</strong><br/>
                Founder, Zevio<br/>
                <a href="tel:+447877262518">+44 7877 262518</a>
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="font-size:12px;color:#999">Zevio · AI Automation for Local Businesses · <a href="https://zevio.co.uk">zevio.co.uk</a></p>
            </div>
          `
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
