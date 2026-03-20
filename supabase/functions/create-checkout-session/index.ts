import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS: Record<string, string> = {
  Growth:     'price_1TCZCqRyKSji3VLOU3TNHZon',
  Pro:        'price_1TCZCqRyKSji3VLO4TJxemFu',
  Enterprise: 'price_1TCZCrRyKSji3VLOsSrORdZc',
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

  const { plan, business_id, success_url, cancel_url } = await req.json()

  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return new Response(JSON.stringify({ error: `Unknown plan: ${plan}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Verify user is a member/owner of this business
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('business_id', business_id)
    .single()

  if (!membership) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('stripe_customer_id, name')
    .eq('id', business_id)
    .single()

  const customerId = business?.stripe_customer_id
  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Stripe customer not provisioned. Call /provision-stripe-customer first.' }), {
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: success_url ?? 'https://zevio.co.uk/?checkout=success',
    cancel_url: cancel_url ?? 'https://zevio.co.uk/?checkout=cancelled',
    metadata: { business_id, user_id: user.id, plan },
    subscription_data: {
      metadata: { business_id, user_id: user.id, plan },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    currency: 'gbp',
  })

  return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
