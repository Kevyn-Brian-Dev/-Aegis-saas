'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, browser redirects — no need to setLoading(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg,#0072ff,#00e5ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 900, color: '#fff',
          margin: '0 auto 14px',
          boxShadow: '0 6px 20px rgba(0,114,255,.35)',
        }}>A</div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-.4px', color: 'var(--text1)' }}>
          Aegis Investor Suite
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text2)', marginTop: '6px' }}>
          Ferramentas financeiras profissionais
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: '32px 28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Entrar na plataforma</h2>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '28px', lineHeight: 1.55 }}>
          Acesse com sua conta Google. Após o login, ative seu acesso por <strong style={{ color: 'var(--cyan)' }}>R$&nbsp;19,90/mês</strong> para usar todos os módulos.
        </p>

        {error && (
          <div style={{
            background: 'var(--red-dim)', border: '1px solid rgba(255,23,68,.22)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            fontSize: '12.5px', color: '#ff6b81', marginBottom: '16px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          className="btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', gap: '10px',
            background: '#fff', color: '#1a1a2e',
            fontSize: '14px', fontWeight: 700,
            padding: '13px 20px',
            border: '1px solid #e0e0e0',
            opacity: loading ? .7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="spin" style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid #ccc', borderTopColor: '#0072ff', display: 'inline-block',
              }} />
              Redirecionando…
            </span>
          ) : (
            <>
              <GoogleIcon />
              Continuar com Google
            </>
          )}
        </button>

        <p style={{
          fontSize: '11px', color: 'var(--text3)', textAlign: 'center',
          marginTop: '20px', lineHeight: 1.6,
        }}>
          Ao entrar, você concorda com os termos de uso e política de privacidade. Nenhum dado financeiro é armazenado em servidores.
        </p>
      </div>

      {/* Features preview */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { icon: '📈', text: 'Juros Compostos com gráfico nativo' },
          { icon: '🏢', text: 'Avaliador Multi-Critérios de FIIs' },
          { icon: '⚖️', text: 'Preço Teto Graham + Bazin comparados' },
          { icon: '🍕', text: 'Asset Allocation com rebalanceamento' },
          { icon: '🧮', text: 'Preço Médio com memória local' },
        ].map((f) => (
          <div key={f.text} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '12.5px', color: 'var(--text2)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '9px 14px',
          }}>
            <span style={{ fontSize: '15px' }}>{f.icon}</span>
            {f.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
