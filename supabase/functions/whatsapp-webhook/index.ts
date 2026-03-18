import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 360Dialog sends a GET to verify the webhook endpoint
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const challenge = url.searchParams.get('hub.challenge')
    if (challenge) return new Response(challenge)
    return new Response('ok')
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // 360Dialog webhook payload structure
  const messages = payload?.messages ?? []
  const wabaNumber = payload?.contacts?.[0]?.wa_id ?? payload?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id

  for (const msg of messages) {
    const fromPhone = msg.from
    const content = msg.text?.body ?? msg.caption ?? '[media]'
    const wabaId = payload?.metadata?.phone_number_id ?? wabaNumber

    if (!fromPhone) continue

    // Find business by whatsapp_number
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('whatsapp_number', wabaId)
      .single()

    const businessId = business?.id
    if (!businessId) continue

    // Find or create contact
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('business_id', businessId)
      .eq('phone', fromPhone)
      .single()

    let contactId = existingContact?.id
    if (!contactId) {
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({ business_id: businessId, phone: fromPhone, name: msg.profile?.name ?? null })
        .select('id')
        .single()
      contactId = newContact?.id
    }

    if (!contactId) continue

    // Find or create conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('business_id', businessId)
      .eq('contact_id', contactId)
      .single()

    let convId = existingConv?.id
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ business_id: businessId, contact_id: contactId })
        .select('id')
        .single()
      convId = newConv?.id
    }

    if (!convId) continue

    // Store message
    await supabase.from('messages').insert({
      conversation_id: convId,
      direction: 'inbound',
      content,
      status: 'delivered',
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
