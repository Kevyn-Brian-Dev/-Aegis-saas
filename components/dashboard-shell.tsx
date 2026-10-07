'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { id: 'juros',    label: 'Hub de Juros Compostos',   icon: '📈', badge: 'GRÁFICO', path: '/dashboard/juros'      },
  { id: 'fii',      label: 'Avaliador de FIIs',          icon: '🏢', badge: null,      path: '/dashboard/fii'        },
  { id: 'graham',   label: 'Radar Preço Teto',           icon: '⚖️', badge: null,      path: '/dashboard/graham'     },
  { id: 'alloc',    label: 'Asset Allocation',           icon: '🍕', badge: null,      path: '/dashboard/allocation' },
  { id: 'pmedio',   label: 'Preço Médio',                icon: '🧮', badge: null,      path: '/dashboard/pmedio'     },
]

const PANEL_META: Record<string, { title: string; sub: string }> = {
  '/dashboard/juros':      { title: 'Hub de Juros Compostos',       sub: 'Simulação de patrimônio com evolução gráfica'             },
  '/dashboard/fii':        { title: 'Avaliador Multi-Critérios de FIIs', sub: 'Pontuação inteligente por tipo de fundo'             },
  '/dashboard/graham':     { title: 'Radar de Preço Teto',          sub: 'Graham vs Bazin — maior margem de segurança'             },
  '/dashboard/allocation': { title: 'Simulador de Asset Allocation', sub: 'Rebalanceamento preciso da carteira'                    },
  '/dashboard/pmedio':     { title: 'Calculadora de Preço Médio',   sub: 'Controle de lotes com memória local'                    },
}

interface Props {
  children: React.ReactNode
  email: string
  fullName: string | null
  avatarUrl: string | null
  subscriptionEnd: string | null
}

export default function DashboardShell({ children, email, fullName, avatarUrl, subscriptionEnd }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen]         = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const meta = PANEL_META[pathname] ?? { title: 'Dashboard', sub: 'Aegis Investor Suite' }

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false) }, [pathname])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const subEndFormatted = subscriptionEnd
    ? new Date(subscriptionEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 190,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(2px)',
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '240px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 200,
        transition: 'transform .18s ease',
      }}
        className={`sidebar ${open ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#0072ff,#00e5ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 900, color: '#fff', flexShrink: 0,
              boxShadow: '0 4px 14px rgba(0,114,255,.35)',
            }}>A</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-.3px' }}>Aegis</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '.8px', textTransform: 'uppercase' }}>Investor Suite</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.path
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '10px 13px', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: active ? 600 : 500,
                  color: active ? 'var(--cyan)' : 'var(--text2)',
                  background: active ? 'rgba(0,114,255,.14)' : 'transparent',
                  border: 'none', width: '100%', textAlign: 'left',
                  transition: 'background .18s ease, color .18s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '17px', width: '20px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '.4px',
                    background: 'rgba(0,229,255,.12)', color: 'var(--cyan)',
                    borderRadius: '99px', padding: '2px 6px', flexShrink: 0,
                  }}>{item.badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--surface3)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'var(--text2)', flexShrink: 0,
              }}>
                {(fullName ?? email).charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {fullName && <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</div>}
              <div style={{ fontSize: '11px', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
            </div>
          </div>

          {subEndFormatted && (
            <div style={{
              fontSize: '10.5px', color: 'var(--text3)',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)', flexShrink: 0 }} />
              Ativo até {subEndFormatted}
            </div>
          )}

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: 'transparent', border: '1px solid var(--border2)',
              borderRadius: '6px', padding: '7px 12px',
              fontSize: '12px', fontWeight: 600, color: 'var(--text2)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .18s ease',
              opacity: signingOut ? .6 : 1,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' }}
          >
            {signingOut ? 'Saindo…' : '↩ Sair'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ marginLeft: '240px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(9,10,15,.88)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 32px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(o => !o)}
            className="mobile-menu-btn"
            style={{
              display: 'none', background: 'var(--surface2)',
              border: '1px solid var(--border2)', borderRadius: '8px',
              width: '36px', height: '36px', cursor: 'pointer',
              fontSize: '18px', color: 'var(--text1)', flexShrink: 0,
              alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
            }}
          >☰</button>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-.2px' }}>{meta.title}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text3)', marginTop: '1px' }}>{meta.sub}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '.4px',
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: '99px', padding: '4px 11px', color: 'var(--text2)',
            }}>v2.0</span>
            <span style={{
              fontSize: '11px', fontWeight: 600,
              background: 'var(--green-dim)', border: '1px solid rgba(0,230,118,.2)',
              borderRadius: '99px', padding: '4px 11px', color: 'var(--green)',
            }}>● Pro</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '32px', flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Responsive CSS injected inline to avoid Tailwind dependency */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-240px); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
          div[style*="margin-left: 240px"] { margin-left: 0 !important; }
          header[style*="padding: 0 32px"] { padding: 0 16px 0 12px !important; }
          main[style*="padding: 32px"] { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  )
}
