import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Decode JWT payload without verification (used only for role check)
function jwtRole(token: string): string {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload)).role ?? ''
  } catch {
    return ''
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const role = jwtRole(token)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let business: { id: string; name: string; stripe_customer_id: string | null }
  let userEmail: string

  if (role === 'service_role') {
    // ── INTERNAL PATH: called from DB trigger via pg_net ─────────────
    // Body contains: { business_id, user_email, business_name }
    const body = await req.json()
    if (!body.business_id || !body.user_email) {
      return new Response(JSON.stringify({ error: 'Missing business_id or user_email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('id, name, stripe_customer_id')
      .eq('id', body.business_id)
      .single()

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    business = data
    userEmail = body.user_email
  } else {
    // ── USER PATH: called with user JWT from frontend ─────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .select('business_id, businesses(id, name, stripe_customer_id)')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()

    if (membershipError || !membership) {
      return new Response(JSON.stringify({ error: 'No business found for user' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    business = membership.businesses as typeof business
    userEmail = user.email!
  }

  // ── IDEMPOTENCY 1: customer ID already in DB ──────────────────────
  if (business.stripe_customer_id) {
    return new Response(
      JSON.stringify({ stripe_customer_id: business.stripe_customer_id, created: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  // ── IDEMPOTENCY 2: search Stripe by business_id metadata ─────────
  const existing = await stripe.customers.search({
    query: `metadata['business_id']:'${business.id}'`,
    limit: 1,
  })

  let customerId: string

  if (existing.data.length > 0) {
    customerId = existing.data[0].id
  } else {
    const customer = await stripe.customers.create(
      {
        email: userEmail,
        name: business.name,
        metadata: { business_id: business.id },
      },
      { idempotencyKey: `create-customer-${business.id}` }
    )
    customerId = customer.id
  }

  const { error: updateError } = await supabaseAdmin
    .from('businesses')
    .update({ stripe_customer_id: customerId })
    .eq('id', business.id)

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      stripe_customer_id: customerId,
      business_id: business.id,
      created: existing.data.length === 0,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
