import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback handler.
 * Supabase redirects here after Google login.
 * Exchanges the code for a session, then routes to the correct page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')

  if (error) {
    console.error('[auth/callback] OAuth error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Successful auth — redirect to intended page or dashboard
      const redirectUrl = next.startsWith('/') ? `${origin}${next}` : origin + '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    console.error('[auth/callback] Exchange error:', exchangeError.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
