import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'admin@zevio.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify user is admin (same pattern as /me)
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Service role client for data access
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const supabase = supabaseAdmin
  const method = req.method
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // GET — fetch all businesses
  if (method === 'GET') {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select(`
        id, name, plan, whatsapp_number, stripe_customer_id, created_at,
        subscriptions ( id, status, current_period_end, stripe_subscription_id ),
        memberships ( user_id )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ businesses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // POST — create new client
  if (method === 'POST') {
    const { name, email, password, plan } = await req.json()
    if (!name || !email || !password || !plan) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create auth user
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({ name, plan })
      .select()
      .single()
    if (bizError) {
      return new Response(JSON.stringify({ error: bizError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create membership
    await supabase.from('memberships').insert({
      user_id: newUser.user.id,
      business_id: business.id,
      role: 'owner',
    })

    return new Response(JSON.stringify({ success: true, business, user: newUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
