/**
 * send-followup — processes the email_queue and sends pending emails via Resend
 *
 * Call this from a pg_cron job or Supabase scheduled function (every hour):
 *   supabase functions invoke send-followup --no-verify-jwt
 *
 * It picks up all email_queue rows where send_after <= now() and status = 'pending',
 * sends them via Resend, and marks them sent.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Fetch pending emails that are due
  const { data: queue, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('send_after', new Date().toISOString())
    .limit(50)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const results = []

  for (const item of queue ?? []) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Akhyar at Zevio <onboarding@resend.dev>',
          to: [item.to_email],
          subject: item.subject,
          html: item.html,
        })
      })

      if (res.ok) {
        await supabase.from('email_queue').update({
          status: 'sent',
          sent_at: new Date().toISOString()
        }).eq('id', item.id)
        results.push({ id: item.id, to: item.to_email, status: 'sent' })
      } else {
        await supabase.from('email_queue').update({ status: 'failed' }).eq('id', item.id)
        results.push({ id: item.id, to: item.to_email, status: 'failed' })
      }
    } catch {
      await supabase.from('email_queue').update({ status: 'failed' }).eq('id', item.id)
      results.push({ id: item.id, to: item.to_email, status: 'error' })
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
