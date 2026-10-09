import { NextResponse, type NextRequest } from 'next/server'
import { stripe, PRICE_ID, absoluteUrl } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json() as { userId: string; email: string }

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId e email são obrigatórios.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = (profile as any)?.stripe_customer_id ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id

      await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: absoluteUrl('/dashboard?success=true'),
      cancel_url: absoluteUrl('/checkout?canceled=true'),
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}