import { NextResponse, type NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 * Receives and processes Stripe webhook events.
 *
 * Required Stripe events to enable in the dashboard:
 *  - customer.subscription.created
 *  - customer.subscription.updated
 *  - customer.subscription.deleted
 *  - invoice.payment_succeeded
 *  - invoice.payment_failed
 */

// Use the service role key here — bypasses RLS to update profiles
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

async function upsertSubscription(
  customerId: string,
  subscriptionId: string,
  status: SubscriptionStatus,
  periodEnd: number
) {
  const supabase = getServiceClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      subscription_period_end: new Date(periodEnd * 1000).toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[webhook] upsertSubscription error:', error.message)
    throw error
  }
}

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    console.error('[webhook] Signature verification failed:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscription(
          sub.customer as string,
          sub.id,
          sub.status as SubscriptionStatus,
          sub.current_period_end
        )
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscription(
          sub.customer as string,
          sub.id,
          'canceled',
          sub.current_period_end
        )
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await upsertSubscription(
            sub.customer as string,
            sub.id,
            sub.status as SubscriptionStatus,
            sub.current_period_end
          )
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await upsertSubscription(
            sub.customer as string,
            sub.id,
            'past_due',
            sub.current_period_end
          )
        }
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = { api: { bodyParser: false } }
