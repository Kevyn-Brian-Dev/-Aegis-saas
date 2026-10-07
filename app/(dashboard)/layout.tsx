import { requireAuth, hasActiveSubscription } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard-shell'

/**
 * Dashboard group layout.
 * Server Component — runs auth + subscription check before rendering.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, profile } = await requireAuth()

  if (!(await hasActiveSubscription(userId))) {
    redirect('/checkout')
  }

  return (
    <DashboardShell
      email={email}
      fullName={profile?.full_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      subscriptionEnd={profile?.subscription_period_end ?? null}
    >
      {children}
    </DashboardShell>
  )
}
