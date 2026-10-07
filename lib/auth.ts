import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

/**
 * Returns the authenticated user + profile, or redirects to /login.
 * Use in Server Components that require authentication.
 */
export async function requireAuth(): Promise<{
  userId: string
  email: string
  profile: Profile | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    userId: user.id,
    email: user.email ?? '',
    profile: profile ?? null,
  }
}

/**
 * Returns true when the user has an active Stripe subscription.
 * Checks the `profiles` table column `subscription_status`.
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .single()

  return data?.subscription_status === 'active'
}
