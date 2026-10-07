import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

/**
 * Stripe redirects here after successful payment.
 * Shows a confirmation and links to the dashboard.
 */
export default async function CheckoutSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>

        <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-.4px', marginBottom: '10px' }}>
          Acesso Ativado!
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.65, marginBottom: '32px' }}>
          Sua assinatura foi confirmada. Bem-vindo ao <strong style={{ color: 'var(--cyan)' }}>Aegis Investor Suite</strong> — todos os 5 módulos estão disponíveis para você.
        </p>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '18px 20px',
          marginBottom: '24px', textAlign: 'left',
        }}>
          {[
            '📈 Hub de Juros Compostos com gráfico',
            '🏢 Avaliador Multi-Critérios de FIIs',
            '⚖️ Radar Preço Teto Graham + Bazin',
            '🍕 Asset Allocation + rebalanceamento',
            '🧮 Preço Médio com memória local',
          ].map(f => (
            <div key={f} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: 'var(--text1)', padding: '5px 0',
            }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
        >
          Ir para o Dashboard →
        </Link>
      </div>
    </div>
  )
}
