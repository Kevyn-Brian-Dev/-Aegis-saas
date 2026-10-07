import { redirect } from 'next/navigation'

/**
 * /dashboard → redirect to the first module.
 * The layout already handles auth + subscription guards.
 */
export default function DashboardIndexPage() {
  redirect('/dashboard/juros')
}
