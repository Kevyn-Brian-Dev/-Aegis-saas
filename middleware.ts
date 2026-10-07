import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Se não tem chave ainda, deixa passar pra ver a landing page
  if (!url || !key || url.includes('demo') || url.includes('xxxx')) {
    return NextResponse.next()
  }

  // Se tem chave, tenta auth (código original)
  try {
    const { createServerClient } = await import('@supabase/ssr')
    let response = NextResponse.next({ request: { headers: req.headers } })
    const supabase = createServerClient(url, key, {
     cookies: {
  getAll() { return req.cookies.getAll() },
  setAll(cookies: any) { cookies.forEach((c: any) => response.cookies.set(c)) }
}
    })
    await supabase.auth.getUser()
    return response
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}