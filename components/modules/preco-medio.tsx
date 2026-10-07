'use client'

import { useState, useEffect, useCallback } from 'react'
import { calcularPMedio, fmt, fmtN, type Lote } from '@/lib/finance'

const PM_KEY = 'aegis_pmedio_lotes'

export default function PrecoMedio() {
  const [ticker,  setTicker]  = useState('')
  const [lotes,   setLotes]   = useState<Lote[]>([{ qtd: 0, preco: 0 }])
  const [result,  setResult]  = useState<ReturnType<typeof calcularPMedio>>(null)
  const [saved,   setSaved]   = useState(false)
  const [loaded,  setLoaded]  = useState(false)
  const [tickErr, setTickErr] = useState(false)

  function addLote() {
    setLotes(prev => [...prev, { qtd: 0, preco: 0 }])
  }

  function removeLote(idx: number) {
    setLotes(prev => prev.filter((_, i) => i !== idx))
  }

  function updateLote(idx: number, field: keyof Lote, value: string) {
    setLotes(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: parseFloat(value) || 0 }
      return next
    })
  }

  function calculate() {
    if (!ticker.trim()) { setTickErr(true); return }
    setTickErr(false)
    setResult(calcularPMedio(lotes))
  }

  function clear() {
    setTicker(''); setLotes([{ qtd: 0, preco: 0 }])
    setResult(null); setSaved(false); setLoaded(false); setTickErr(false)
  }

  function save() {
    if (!ticker.trim()) { setTickErr(true); return }
    try {
      localStorage.setItem(PM_KEY, JSON.stringify({ ticker, lotes, ts: Date.now() }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* storage unavailable */ }
  }

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(PM_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as { ticker: string; lotes: Lote[]; ts: number }
      setTicker(data.ticker ?? '')
      setLotes(data.lotes?.length ? data.lotes : [{ qtd: 0, preco: 0 }])
      setLoaded(true)
      setTimeout(() => setLoaded(false), 2500)
    } catch { /* parse error */ }
  }, [])

  // Auto-calculate whenever lotes change if ticker is set
  useEffect(() => {
    if (ticker && lotes.some(l => l.qtd > 0 && l.preco > 0)) {
      setResult(calcularPMedio(lotes))
    }
  }, [lotes, ticker])

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '8px' }}>
          <span style={{ width: '14px', height: '2px', background: 'linear-gradient(135deg,#0072ff,#00e5ff)', display: 'inline-block', borderRadius: '2px' }} />
          Controle
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-.5px' }}>Calculadora de Preço Médio</h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '5px' }}>Gerencie lotes de compra de um ativo. Os dados ficam salvos no navegador (localStorage).</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>Ticker do Ativo</label>
            <input
              className={`form-input${tickErr ? ' error' : ''}`}
              type="text" value={ticker}
              onChange={e => { setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setTickErr(false) }}
              placeholder="Ex: ITUB4" maxLength={8}
            />
          </div>
          <button
            className="btn btn-ghost"
            onClick={load}
            style={{ height: '40px', marginBottom: '1px', fontSize: '12.5px' }}
          >
            {loaded ? '✅ Carregado!' : '📂 Carregar Salvo'}
          </button>
        </div>

        {/* Lotes */}
        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)', marginBottom: '10px' }}>
          Lotes de Compra
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {lotes.map((lote, i) => (
            <div key={i} className="fade-up" style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', width: '22px', textAlign: 'center', flexShrink: 0 }}>
                #{i + 1}
              </span>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>Quantidade</div>
                  <input
                    className="form-input"
                    type="number" placeholder="Ex: 100" min={0} step="any"
                    value={lote.qtd || ''}
                    onChange={e => updateLote(i, 'qtd', e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>Preço Pago (R$)</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none' }}>R$</span>
                    <input
                      className="form-input pre"
                      type="number" placeholder="Ex: 25,40" min={0} step="any"
                      value={lote.preco || ''}
                      onChange={e => updateLote(i, 'preco', e.target.value)}
                      style={{ padding: '8px 10px 8px 28px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeLote(i)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '16px', padding: '4px', transition: 'color .18s ease', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
              >✕</button>
            </div>
          ))}
        </div>

        <button className="btn btn-green" onClick={addLote} style={{ fontSize: '13px', padding: '9px 18px', marginBottom: '4px' }}>
          ＋ Adicionar Lote
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={calculate}>✦ Calcular Preço Médio</button>
          <button className="btn btn-ghost" onClick={save} style={{ fontSize: '13px' }}>
            {saved ? '✅ Salvo!' : '💾 Salvar'}
          </button>
          <button className="btn btn-red" onClick={clear} style={{ fontSize: '13px' }}>🗑 Limpar</button>
        </div>
      </div>

      {result && (
        <div className="fade-up">
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginTop: '24px' }}>
            {[
              { label: 'Preço Médio',        val: fmt(result.precoMedio),    color: 'var(--cyan)',  accent: 'var(--cyan)',   sub: 'Por ação / cota' },
              { label: 'Total Acumulado',     val: fmtN(result.totalQtd, 0), color: 'var(--text1)', accent: 'var(--grad)',   sub: 'Ações / cotas' },
              { label: 'Capital Total Alocado', val: fmt(result.totalCapital), color: 'var(--green)', accent: 'var(--green)', sub: 'Investimento total' },
            ].map(k => (
              <div key={k.label} className="kpi-card" style={{ '--kpi-accent': k.accent } as React.CSSProperties}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-val" style={{ color: k.color, fontSize: '24px' }}>{k.val}</div>
                <div className="kpi-sub">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Detalhamento por Lote</div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Lote #</th><th>Quantidade</th><th>Preço Pago (R$)</th><th>Total do Lote</th><th>% do Capital</th>
              </tr></thead>
              <tbody>
                {result.lotes.map(l => (
                  <tr key={l.idx}>
                    <td>Lote #{l.idx}</td>
                    <td>{fmtN(l.qtd, 0)}</td>
                    <td>{fmt(l.preco)}</td>
                    <td className="td-cyan">{fmt(l.total)}</td>
                    <td>{fmtN(l.pct, 2)}%</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border2)' }}>
                  <td style={{ color: 'var(--text1)' }}>Total / Médio</td>
                  <td style={{ color: 'var(--cyan)', textAlign: 'right' }}>{fmtN(result.totalQtd, 0)}</td>
                  <td style={{ color: 'var(--cyan)', textAlign: 'right' }}>{fmt(result.precoMedio)}</td>
                  <td style={{ color: 'var(--green)', textAlign: 'right' }}>{fmt(result.totalCapital)}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!result && (
        <div className="placeholder">
          <div className="ph-icon">🧮</div>
          <div className="ph-text">Adicione os lotes de compra acima e clique em <strong>Calcular</strong> para obter o preço médio.</div>
        </div>
      )}
    </div>
  )
}
