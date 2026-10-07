import { NextResponse, type NextRequest } from 'next/server'
import { stripe, PRICE_ID, absoluteUrl } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session and returns { url }.
 * Body: { userId: string, email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json() as { userId: string; email: string }

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId e email são obrigatórios.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id

      // Persist customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: absoluteUrl('/checkout/success?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url:  absoluteUrl('/checkout'),
      locale: 'pt-BR',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
      metadata: { supabase_user_id: userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
