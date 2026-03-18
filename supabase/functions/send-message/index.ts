import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { conversation_id, content } = await req.json()
  if (!conversation_id || !content) {
    return new Response(JSON.stringify({ error: 'conversation_id and content are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Verify user is member of this conversation's business
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, business_id, contacts(phone), businesses(whatsapp_number)')
    .eq('id', conversation_id)
    .single()

  if (!conv) {
    return new Response(JSON.stringify({ error: 'Conversation not found or access denied' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const toPhone = (conv.contacts as any)?.phone
  const fromNumber = (conv.businesses as any)?.whatsapp_number
  const dialogApiKey = Deno.env.get('DIALOG_API_KEY')!

  // Send via 360Dialog
  const dialogResp = await fetch(`https://waba.360dialog.io/v1/messages`, {
    method: 'POST',
    headers: {
      'D360-API-KEY': dialogApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient_type: 'individual',
      to: toPhone,
      type: 'text',
      text: { body: content },
    }),
  })

  if (!dialogResp.ok) {
    const errBody = await dialogResp.text()
    return new Response(JSON.stringify({ error: '360Dialog error', detail: errBody }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Store message in DB
  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      direction: 'outbound',
      content,
      status: 'sent',
    })
    .select()
    .single()

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
