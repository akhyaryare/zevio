import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const clients = [
  { email: 'admin@damalrestaurant.uk',   name: 'Damal Restaurant' },
  { email: 'info@najmarestaurant.co.uk', name: 'Najma Restaurant' },
  { email: 'info@starbarbers.co.uk',     name: 'Star Barbers Hayes' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const results = []

  for (const client of clients) {
    // Create user with a temporary password
    const tempPass = 'Zevio2026!' + Math.floor(Math.random() * 9000 + 1000)
    const { data, error } = await supabase.auth.admin.createUser({
      email: client.email,
      password: tempPass,
      email_confirm: true,
      user_metadata: { name: client.name }
    })

    if (error && !error.message.includes('already been registered')) {
      results.push({ email: client.email, status: 'error', message: error.message })
      continue
    }

    // Send password reset so they set their own password
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: client.email,
    })

    results.push({
      email: client.email,
      status: error ? 'already exists' : 'created',
      resetSent: !resetError,
    })
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
