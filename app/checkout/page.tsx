import { redirect } from 'next/navigation'
import { requireAuth, hasActiveSubscription } from '@/lib/auth'
import CheckoutClient from './checkout-client'

/**
 * Paywall page — server component.
 * Handles the auth/subscription guards before rendering the client component.
 */
export default async function CheckoutPage() {
  const { userId, email, profile } = await requireAuth()

  // Already subscribed → go straight to dashboard
  if (await hasActiveSubscription(userId)) {
    redirect('/dashboard')
  }

  return (
    <CheckoutClient
      userId={userId}
      email={email}
      avatarUrl={profile?.avatar_url ?? null}
      fullName={profile?.full_name ?? null}
    />
  )
}
