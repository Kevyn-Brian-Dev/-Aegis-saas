'use client'

import { useState } from 'react'

interface Props {
  userId: string
  email: string
  avatarUrl: string | null
  fullName: string | null
}

const FEATURES = [
  { icon: '📈', label: 'Hub de Juros Compostos', desc: 'Gráfico SVG nativo + poder de compra ajustado à inflação' },
  { icon: '🏢', label: 'Avaliador Multi-Critérios de FIIs', desc: 'Tijolo, Papel, FoF — pontuação inteligente por tipo' },
  { icon: '⚖️', label: 'Radar Preço Teto', desc: 'Graham vs Bazin lado a lado com margem de segurança real' },
  { icon: '🍕', label: 'Asset Allocation', desc: 'Pizza SVG dupla + rebalanceamento automático de carteira' },
  { icon: '🧮', label: 'Preço Médio com Memória', desc: 'Múltiplos lotes salvos no navegador via localStorage' },
]

export default function CheckoutClient({ userId, email, fullName, avatarUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Erro ao criar sessão de pagamento.')
        setLoading(false)
        return
      }
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg,#0072ff,#00e5ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 900, color: '#fff',
            margin: '0 auto 14px',
            boxShadow: '0 6px 20px rgba(0,114,255,.35)',
          }}>A</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-.5px' }}>
            Ativar Acesso Completo
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '7px' }}>
            Uma assinatura, todos os 5 módulos desbloqueados.
          </p>
        </div>

        {/* Price card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px 24px',
          boxShadow: '0 4px 28px rgba(0,0,0,.5)', marginBottom: '16px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
            width: '220px', height: '220px',
            background: 'radial-gradient(circle, rgba(0,114,255,.07), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* User info */}
          {(fullName || email) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '24px', padding: '10px 12px',
              background: 'var(--surface2)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border2)',
            }}>
              {avatarUrl && (
                <img src={avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              )}
              <div>
                {fullName && <div style={{ fontSize: '13px', fontWeight: 600 }}>{fullName}</div>}
                <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{email}</div>
              </div>
            </div>
          )}

          {/* Price */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text3)', marginBottom: '8px' }}>
              Plano Pro
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text2)' }}>R$</span>
              <span style={{
                fontSize: '56px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
                background: 'linear-gradient(135deg,#0072ff,#00e5ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>19,90</span>
              <span style={{ fontSize: '14px', color: 'var(--text3)', marginLeft: '4px' }}>/mês</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>
              Cancele quando quiser • Sem fidelidade
            </div>
          </div>

          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '10px 12px',
                background: 'var(--surface2)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text2)', marginTop: '2px' }}>{f.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '15px', flexShrink: 0 }}>✓</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,23,68,.22)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontSize: '12.5px', color: '#ff6b81', marginBottom: '14px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: '100%', fontSize: '15px', padding: '14px',
              opacity: loading ? .7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spin" style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                  display: 'inline-block',
                }} />
                Abrindo checkout seguro…
              </span>
            ) : (
              <>🔒 Assinar agora — R$ 19,90/mês</>
            )}
          </button>

          <p style={{
            fontSize: '11px', color: 'var(--text3)', textAlign: 'center',
            marginTop: '14px', lineHeight: 1.6,
          }}>
            Pagamento processado com segurança pelo <strong style={{ color: 'var(--text2)' }}>Stripe</strong>. Acesso liberado imediatamente após confirmação.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/login" style={{ fontSize: '12px', color: 'var(--text3)', textDecoration: 'none' }}>
            ← Entrar com outra conta
          </a>
        </div>
      </div>
    </div>
  )
}
