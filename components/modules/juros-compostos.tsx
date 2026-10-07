'use client'

import { useState, useRef, useEffect } from 'react'
import { calcularJuros, fmt, fmtN, fmtP, type JurosRow } from '@/lib/finance'

export default function JurosCompostos() {
  const [inicial,     setInicial]     = useState('')
  const [mensal,      setMensal]      = useState('')
  const [taxa,        setTaxa]        = useState('')
  const [taxaTipo,    setTaxaTipo]    = useState<'aa' | 'am'>('aa')
  const [periodo,     setPeriodo]     = useState('')
  const [periodoTipo, setPeriodoTipo] = useState<'anos' | 'meses'>('anos')
  const [inflacao,    setInflacao]    = useState('')
  const [errors,      setErrors]      = useState<Record<string, boolean>>({})
  const [result,      setResult]      = useState<ReturnType<typeof calcularJuros> | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  function validate() {
    const e: Record<string, boolean> = {}
    const t = parseFloat(taxa)
    const p = parseInt(periodo)
    if (isNaN(t) || t <= 0) e.taxa = true
    if (isNaN(p) || p <= 0) e.periodo = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function calculate() {
    if (!validate()) return
    const res = calcularJuros({
      inicial:     parseFloat(inicial) || 0,
      mensal:      parseFloat(mensal)  || 0,
      taxa:        parseFloat(taxa),
      taxaTipo,
      periodo:     parseInt(periodo),
      periodoTipo,
      inflacao:    parseFloat(inflacao) || 0,
    })
    setResult(res)
  }

  function clear() {
    setInicial(''); setMensal(''); setTaxa(''); setPeriodo(''); setInflacao('')
    setErrors({}); setResult(null)
  }

  // Build display rows
  const displayRows: JurosRow[] = (() => {
    if (!result) return []
    const rows = result.rows
    const totalMeses = periodoTipo === 'anos' ? parseInt(periodo) * 12 : parseInt(periodo)
    if (totalMeses > 60 && periodoTipo === 'anos') {
      return rows.filter((r, i) => i === 0 || r.periodo % 12 === 0)
    }
    return rows
  })()

  const isAnos = periodoTipo === 'anos'
  const totalMeses = periodoTipo === 'anos' ? parseInt(periodo || '0') * 12 : parseInt(periodo || '0')

  // SVG chart
  useEffect(() => {
    if (!result || !svgRef.current) return
    const rows = result.rows
    const svg  = svgRef.current
    const W    = svg.clientWidth || 700
    const H    = 220
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

    let pts = rows
    if (rows.length > 120) {
      const step = Math.ceil(rows.length / 120)
      pts = rows.filter((_, i) => i === 0 || i % step === 0 || i === rows.length - 1)
    }

    const maxVal = Math.max(...pts.map(r => r.totalAcumulado))
    if (maxVal <= 0) { svg.innerHTML = ''; return }

    const PAD_L = 44, PAD_R = 14, PAD_T = 16, PAD_B = 28
    const iW = W - PAD_L - PAD_R
    const iH = H - PAD_T - PAD_B
    const xS = (i: number) => PAD_L + (i / (pts.length - 1 || 1)) * iW
    const yS = (v: number) => PAD_T + iH - (v / maxVal) * iH

    let totalPath = '', investPath = ''
    pts.forEach((r, i) => {
      const x  = xS(i)
      const yt = yS(r.totalAcumulado)
      const yi = yS(r.totalAcumulado - r.jurosAcumulados)
      const s  = i === 0 ? 'M' : 'L'
      totalPath  += `${s}${x},${yt} `
      investPath += `${s}${x},${yi} `
    })

    const bot    = H - PAD_B
    const firstX = xS(0), lastX = xS(pts.length - 1)
    const totalArea  = `M${firstX},${bot} ` + totalPath.replace(/^M/, 'L')  + ` L${lastX},${bot} Z`
    const investArea = `M${firstX},${bot} ` + investPath.replace(/^M/, 'L') + ` L${lastX},${bot} Z`

    const gridLines = [0, .25, .5, .75, 1].map(f => {
      const y   = PAD_T + iH * (1 - f)
      const val = maxVal * f
      const lbl = val >= 1e6 ? (val / 1e6).toFixed(1) + 'M' : val >= 1e3 ? (val / 1e3).toFixed(0) + 'K' : val.toFixed(0)
      return `<line x1="${PAD_L}" y1="${y}" x2="${W - PAD_R}" y2="${y}" stroke="#1e2230" stroke-width="1"/>
              <text x="${PAD_L - 4}" y="${y + 4}" text-anchor="end" fill="#555f7a" font-size="9" font-family="Inter,sans-serif">${lbl}</text>`
    }).join('')

    svg.innerHTML = `
      <defs>
        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00e676" stop-opacity=".3"/>
          <stop offset="100%" stop-color="#00e676" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gInvest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity=".3"/>
          <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${totalArea}"  fill="url(#gTotal)"/>
      <path d="${investArea}" fill="url(#gInvest)"/>
      <path d="${totalPath}"  fill="none" stroke="#00e676" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${investPath}" fill="none" stroke="#00e5ff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="5,3"/>
    `
  }, [result])

  return (
    <div className="fade-up">
      <div className="sec-header" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '8px' }}>
          <span style={{ width: '14px', height: '2px', background: 'linear-gradient(135deg,#0072ff,#00e5ff)', display: 'inline-block', borderRadius: '2px' }} />
          Simulação
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-.5px' }}>Hub de Juros Compostos</h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '5px' }}>Projete o crescimento do seu patrimônio com aportes mensais, gráfico nativo e poder de compra ajustado à inflação.</p>
      </div>

      {/* Form */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '15px', marginBottom: '20px' }}>
          <FormGroup label="Aporte Inicial (R$)">
            <InputPre pre="R$" value={inicial} onChange={setInicial} placeholder="Ex: 10000" error={false} />
          </FormGroup>
          <FormGroup label="Aporte Mensal (R$)">
            <InputPre pre="R$" value={mensal} onChange={setMensal} placeholder="Ex: 1000" error={false} />
          </FormGroup>
          <FormGroup label="Taxa de Juros (%)">
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <InputPre pre="%" value={taxa} onChange={setTaxa} placeholder="Ex: 12" error={!!errors.taxa} onEnter={calculate} />
              </div>
              <div className="toggle-group">
                <button className={`tgl-btn ${taxaTipo === 'aa' ? 'active' : ''}`} onClick={() => setTaxaTipo('aa')}>a.a.</button>
                <button className={`tgl-btn ${taxaTipo === 'am' ? 'active' : ''}`} onClick={() => setTaxaTipo('am')}>a.m.</button>
              </div>
            </div>
          </FormGroup>
          <FormGroup label="Período">
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className={`form-input${errors.periodo ? ' error' : ''}`}
                type="number" value={periodo} onChange={e => setPeriodo(e.target.value)}
                placeholder="Ex: 10" min={1} style={{ flex: 1 }}
                onKeyDown={e => e.key === 'Enter' && calculate()}
              />
              <select className="styled-select" value={periodoTipo} onChange={e => setPeriodoTipo(e.target.value as 'anos' | 'meses')}>
                <option value="anos">Anos</option>
                <option value="meses">Meses</option>
              </select>
            </div>
          </FormGroup>
          <FormGroup label="Inflação Estimada (% a.a.)">
            <InputPre pre="%" value={inflacao} onChange={setInflacao} placeholder="Ex: 5" error={false} onEnter={calculate} />
          </FormGroup>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={calculate}>✦ Calcular</button>
          <button className="btn btn-ghost" onClick={clear}>Limpar</button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="fade-up">
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', margin: '28px 0 24px' }}>
            {[
              { label: 'Total Investido',     val: fmt(result.totalInvestido),   color: 'var(--cyan)',   accent: 'var(--cyan)' },
              { label: 'Total em Juros',       val: fmt(result.totalJuros),       color: 'var(--green)',  accent: 'var(--green)' },
              { label: 'Patrimônio Final',     val: fmt(result.patrimonioFinal),  color: 'var(--text1)', accent: 'var(--grad)' },
              { label: 'Poder de Compra',      val: fmt(result.poderDeCompra),    color: 'var(--orange)', accent: 'var(--orange)',
                sub: parseFloat(inflacao) > 0 ? `Inflação ${fmtN(parseFloat(inflacao))}% a.a.` : 'Sem inflação definida' },
            ].map(k => (
              <div key={k.label} className="kpi-card" style={{ '--kpi-accent': k.accent } as React.CSSProperties}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-val" style={{ color: k.color, fontSize: '24px' }}>{k.val}</div>
                {k.sub && <div className="kpi-sub">{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="chart-wrap">
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Evolução Patrimonial Acumulada
            </div>
            <div style={{ display: 'flex', gap: '18px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[{ color: '#00e5ff', label: 'Total Investido' }, { color: '#00e676', label: 'Juros Acumulados' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text2)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
            <svg ref={svgRef} style={{ display: 'block', width: '100%', overflow: 'visible' }} height={220} />
          </div>

          <div className="divider" />

          {/* Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Evolução Período a Período</span>
            <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '99px', padding: '3px 10px' }}>
              {displayRows.length} períodos
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Período</th><th>Aporte</th><th>Juros do Período</th><th>Juros Acumulados</th><th>Total Acumulado</th>
              </tr></thead>
              <tbody>
                {displayRows.map((r, i) => {
                  const label = i === 0 ? 'Inicial' : (isAnos && totalMeses > 60 ? `Ano ${r.periodo / 12}` : `Mês ${r.periodo}`)
                  return (
                    <tr key={r.periodo}>
                      <td>{label}</td>
                      <td>{fmt(r.aporte)}</td>
                      <td className="td-green">{fmt(r.jurosPeriodo)}</td>
                      <td className="td-green">{fmt(r.jurosAcumulados)}</td>
                      <td className="td-cyan">{fmt(r.totalAcumulado)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!result && (
        <div className="placeholder">
          <div className="ph-icon">📈</div>
          <div className="ph-text">Preencha os campos e clique em <strong>Calcular</strong> para gerar a simulação completa.</div>
        </div>
      )}
    </div>
  )
}

/* ── Shared sub-components ── */
function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)', letterSpacing: '.2px' }}>{label}</label>
      {children}
    </div>
  )
}

function InputPre({ pre, value, onChange, placeholder, error, onEnter }: {
  pre: string; value: string; onChange: (v: string) => void
  placeholder: string; error: boolean; onEnter?: () => void
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '11px', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none', zIndex: 1 }}>{pre}</span>
      <input
        className={`form-input pre${error ? ' error' : ''}`}
        type="number" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{ width: '100%' }}
      />
    </div>
  )
}
