'use client'

import { useState } from 'react'
import { calcularAlloc, ALLOC_CLASSES, fmtN, fmtP, fmt, type AllocId } from '@/lib/finance'

type AllocState = Record<AllocId, string>

const EMPTY: AllocState = { acoes: '', fiis: '', rf: '', cx: '' }

export default function AssetAllocation() {
  const [alvo,   setAlvo]   = useState<AllocState>({ ...EMPTY })
  const [atual,  setAtual]  = useState<AllocState>({ ...EMPTY })
  const [errors, setErrors] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof calcularAlloc> | null>(null)

  const alvoTotal = ALLOC_CLASSES.reduce((s, c) => s + (parseFloat(alvo[c.id]) || 0), 0)
  const alvoOk    = Math.abs(alvoTotal - 100) < 0.5

  function calculate() {
    if (!alvoOk) { setErrors(true); return }
    setErrors(false)
    const alvoN = {} as Record<AllocId, number>
    const atualN = {} as Record<AllocId, number>
    ALLOC_CLASSES.forEach(c => {
      alvoN[c.id]  = parseFloat(alvo[c.id])  || 0
      atualN[c.id] = parseFloat(atual[c.id]) || 0
    })
    setResult(calcularAlloc(alvoN, atualN))
  }

  function clear() {
    setAlvo({ ...EMPTY }); setAtual({ ...EMPTY })
    setErrors(false); setResult(null)
  }

  // SVG Pie helper
  function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const R = 72, cx = 85, cy = 85
    const total = data.reduce((s, d) => s + d.value, 0) || 1
    let angle = -Math.PI / 2
    const paths: string[] = []

    data.forEach(d => {
      if (d.value <= 0) return
      const slice = (d.value / total) * 2 * Math.PI
      const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle)
      angle += slice
      const x2 = cx + R * Math.cos(angle), y2 = cy + R * Math.sin(angle)
      const large = slice > Math.PI ? 1 : 0
      paths.push(`<path d="M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z" fill="${d.color}" opacity=".9" stroke="#090a0f" stroke-width="2"/>`)
    })
    paths.push(`<circle cx="${cx}" cy="${cy}" r="${R * 0.5}" fill="#12141c"/>`)

    return (
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width={170} height={170} viewBox="0 0 170 170" dangerouslySetInnerHTML={{ __html: paths.join('') }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {data.map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text2)' }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
              <span>{d.label} — <strong>{fmtN(d.value, 1)}%</strong></span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '8px' }}>
          <span style={{ width: '14px', height: '2px', background: 'linear-gradient(135deg,#0072ff,#00e5ff)', display: 'inline-block', borderRadius: '2px' }} />
          Estratégia
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-.5px' }}>Simulador de Asset Allocation</h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '5px' }}>Monte sua carteira alvo, compare com o atual e descubra onde fazer o próximo aporte para rebalancear.</p>
      </div>

      <div className="card">
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '10px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ minWidth: '100px' }} />
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)', textAlign: 'center' }}>% Alvo</div>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)', textAlign: 'center' }}>Valor Atual (R$)</div>
        </div>

        {ALLOC_CLASSES.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>{c.label}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none' }}>%</span>
              <input
                className={`form-input pre${errors ? ' error' : ''}`}
                type="number" value={alvo[c.id]}
                onChange={e => setAlvo(prev => ({ ...prev, [c.id]: e.target.value }))}
                placeholder="Ex: 40" min={0} max={100} step="any"
              />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none' }}>R$</span>
              <input
                className="form-input pre"
                type="number" value={atual[c.id]}
                onChange={e => setAtual(prev => ({ ...prev, [c.id]: e.target.value }))}
                placeholder="Ex: 25000" min={0} step="any"
              />
            </div>
          </div>
        ))}

        {/* Total indicator */}
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-sm)', padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '6px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Total % Alvo</span>
          <span style={{
            fontSize: '20px', fontWeight: 800,
            color: alvoOk ? 'var(--green)' : 'var(--red)',
          }}>{fmtN(alvoTotal, 1)}%</span>
        </div>

        {errors && (
          <div style={{ fontSize: '12px', color: 'var(--orange)', marginTop: '8px', padding: '8px 12px', background: 'var(--orange-dim)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,145,0,.2)' }}>
            ⚠️ A soma dos percentuais alvo deve ser exatamente 100%. Atualmente: {fmtN(alvoTotal, 1)}%
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={calculate}>✦ Simular Alocação</button>
          <button className="btn btn-ghost" onClick={clear}>Limpar</button>
        </div>
      </div>

      {result && (
        <div className="fade-up">
          {/* Pie charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
            <div className="chart-wrap">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🍕 Composição Atual</div>
              <PieChart data={ALLOC_CLASSES.map(c => ({ label: c.label, value: result.atualPct[c.id], color: c.color }))} />
            </div>
            <div className="chart-wrap">
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🎯 Composição Alvo</div>
              <PieChart data={ALLOC_CLASSES.map(c => ({ label: c.label, value: parseFloat(alvo[c.id]) || 0, color: c.color }))} />
            </div>
          </div>

          <div className="divider" />

          {/* Desvio table */}
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Análise de Desvio</div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Classe</th><th>Alvo (%)</th><th>Atual (%)</th><th>Desvio</th><th>Valor Atual</th>
              </tr></thead>
              <tbody>
                {result.desvios.map(d => (
                  <tr key={d.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '9px', height: '9px', background: d.color, borderRadius: '50%', display: 'inline-block' }} />
                        {d.label}
                      </span>
                    </td>
                    <td>{fmtP(d.alvo)}</td>
                    <td>{fmtP(d.atual)}</td>
                    <td className={d.dev > 0.5 ? 'td-green' : d.dev < -0.5 ? 'td-red' : ''}>
                      {d.dev >= 0 ? '+' : ''}{fmtN(d.dev)}pp
                    </td>
                    <td>{fmt(d.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rebalance recommendation */}
          {result.rebalClass && result.rebalDesvio > 0.5 ? (
            <div style={{ marginTop: '16px', padding: '16px 18px', borderRadius: 'var(--radius-sm)', fontSize: '13px', lineHeight: 1.55, display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--green-dim)', border: '1px solid rgba(0,230,118,.2)', color: 'var(--green)' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🎯</span>
              <span>
                <strong>📌 Próximo Aporte Recomendado:</strong> Aloque em <strong>{result.rebalLabel}</strong> — desvio de <strong>+{fmtN(result.rebalDesvio)}pp</strong> abaixo da meta. Esta classe está sub-alocada e precisa de reforço para atingir o alvo de {fmtP(parseFloat(alvo[result.rebalClass]) || 0)}.
              </span>
            </div>
          ) : (
            <div style={{ marginTop: '16px', padding: '16px 18px', borderRadius: 'var(--radius-sm)', fontSize: '13px', lineHeight: 1.55, display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--cyan-dim)', border: '1px solid rgba(0,229,255,.18)', color: 'var(--cyan)' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>
              <span><strong>Carteira Balanceada:</strong> Todos os desvios estão dentro de ±0,5 ponto percentual. Nenhum aporte corretivo necessário no momento.</span>
            </div>
          )}
        </div>
      )}

      {!result && (
        <div className="placeholder">
          <div className="ph-icon">🍕</div>
          <div className="ph-text">Defina os percentuais alvo e os valores atuais de cada classe para simular o rebalanceamento.</div>
        </div>
      )}
    </div>
  )
}
