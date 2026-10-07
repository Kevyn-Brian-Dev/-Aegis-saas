'use client'

import { useState } from 'react'
import { calcularGrahamBazin, fmt, fmtN } from '@/lib/finance'

export default function RadarGraham() {
  const [ticker, setTicker] = useState('')
  const [vpa,    setVpa]    = useState('')
  const [lpa,    setLpa]    = useState('')
  const [div,    setDiv]    = useState('')
  const [cot,    setCot]    = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [result, setResult] = useState<ReturnType<typeof calcularGrahamBazin> | null>(null)

  function validate() {
    const e: Record<string, boolean> = {}
    if (!ticker.trim())             e.ticker = true
    if (isNaN(parseFloat(vpa)))     e.vpa    = true
    if (isNaN(parseFloat(lpa)))     e.lpa    = true
    if (isNaN(parseFloat(div)) || parseFloat(div) <= 0) e.div = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function calculate() {
    if (!validate()) return
    const cotN = cot !== '' ? parseFloat(cot) : null
    setResult(calcularGrahamBazin({
      ticker: ticker.toUpperCase(),
      vpa:    parseFloat(vpa),
      lpa:    parseFloat(lpa),
      div:    parseFloat(div),
      cotacao: cotN && cotN > 0 ? cotN : null,
    }))
  }

  function clear() {
    setTicker(''); setVpa(''); setLpa(''); setDiv(''); setCot('')
    setErrors({}); setResult(null)
  }

  const isGrahamWinner = result?.winner === 'graham'
  const isBazinWinner  = result?.winner === 'bazin'

  const gradPrice = 'linear-gradient(135deg,#0072ff,#00e5ff)'
  const gradGreen = 'linear-gradient(135deg,#00e676,#1de9b6)'

  function MarginVal({ val }: { val: number | null }) {
    if (val === null) return <span style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 600 }}>Informe a cotação</span>
    const pos = val >= 0
    return (
      <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-.3px', color: pos ? 'var(--green)' : 'var(--red)' }}>
        {pos ? '+' : ''}{fmtN(val)}%
      </span>
    )
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '8px' }}>
          <span style={{ width: '14px', height: '2px', background: gradPrice, display: 'inline-block', borderRadius: '2px' }} />
          Valuation
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-.5px' }}>Radar de Preço Teto</h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '5px' }}>Compare os métodos de Benjamin Graham e Décio Bazin para encontrar a maior margem de segurança.</p>
      </div>

      {/* Formula info bar */}
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '12px 16px',
        fontSize: '13px', color: 'var(--text2)', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span>🔢</span>
        <span>
          Graham: <code style={{ fontFamily: 'Courier New', color: 'var(--cyan)', background: 'rgba(0,229,255,.06)', padding: '2px 6px', borderRadius: '4px' }}>√(22,5 × VPA × LPA)</code>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          Bazin: <code style={{ fontFamily: 'Courier New', color: 'var(--green)', background: 'rgba(0,230,118,.06)', padding: '2px 6px', borderRadius: '4px' }}>DPA ÷ 0,06</code>
        </span>
      </div>

      <div className="card" style={{ maxWidth: '680px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '15px', marginBottom: '20px' }}>
          {[
            { label: 'Ticker da Ação', key: 'ticker', val: ticker, set: (v: string) => setTicker(v.toUpperCase().replace(/[^A-Z0-9]/g, '')), ph: 'Ex: PETR4', isText: true },
            { label: 'VPA (R$)',       key: 'vpa',    val: vpa,    set: setVpa,    ph: 'Ex: 28,50', pre: 'R$' },
            { label: 'LPA (R$)',       key: 'lpa',    val: lpa,    set: setLpa,    ph: 'Ex: 4,10',  pre: 'R$' },
            { label: 'Dividendos Médios/Ação (R$/ano)', key: 'div', val: div, set: setDiv, ph: 'Ex: 2,40', pre: 'R$' },
            { label: 'Cotação Atual (R$)', key: 'cot', val: cot, set: setCot, ph: 'Ex: 35,00', pre: 'R$', optional: true },
          ].map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>
                {f.label} {f.optional && <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(opcional)</span>}
              </label>
              {f.pre ? (
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none' }}>{f.pre}</span>
                  <input
                    className={`form-input pre${errors[f.key] ? ' error' : ''}`}
                    type="number" value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.ph} step="any"
                    onKeyDown={e => e.key === 'Enter' && calculate()}
                  />
                </div>
              ) : (
                <input
                  className={`form-input${errors[f.key] ? ' error' : ''}`}
                  type={f.isText ? 'text' : 'number'}
                  value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.ph} maxLength={f.isText ? 8 : undefined}
                  onKeyDown={e => e.key === 'Enter' && calculate()}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={calculate}>✦ Calcular Preço Teto</button>
          <button className="btn btn-ghost" onClick={clear}>Limpar</button>
        </div>
      </div>

      {result && !result.negativeError && (
        <div className="fade-up">
          {/* Comparison cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0', marginTop: '28px' }}>
            {/* Graham */}
            <div style={{
              background: isGrahamWinner ? 'rgba(0,230,118,.04)' : 'var(--surface)',
              border: isGrahamWinner ? '1px solid rgba(0,230,118,.25)' : '1px solid var(--border)',
              borderRight: 'none',
              borderRadius: 'var(--radius) 0 0 var(--radius)',
              padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              transition: 'all .18s ease',
            }}>
              {isGrahamWinner && <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '14px' }}>👑</span>}
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>Benjamin Graham</div>
              <div style={{
                fontSize: '44px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
                background: isGrahamWinner ? gradGreen : gradPrice,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{fmt(result.precoGraham)}</div>
              <code style={{ fontFamily: 'Courier New', fontSize: '11px', color: 'var(--text3)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 10px', display: 'inline-block', marginTop: '12px' }}>√(22,5 × VPA × LPA)</code>
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '4px' }}>Margem de Segurança</div>
                <MarginVal val={result.mgGraham} />
              </div>
            </div>

            {/* VS divider */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', background: 'var(--surface2)',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              fontSize: '11px', fontWeight: 700, color: 'var(--text3)', letterSpacing: '.5px',
              writingMode: 'vertical-lr',
            }}>VS</div>

            {/* Bazin */}
            <div style={{
              background: isBazinWinner ? 'rgba(0,230,118,.04)' : 'var(--surface)',
              border: isBazinWinner ? '1px solid rgba(0,230,118,.25)' : '1px solid var(--border)',
              borderLeft: 'none',
              borderRadius: '0 var(--radius) var(--radius) 0',
              padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              {isBazinWinner && <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '14px' }}>👑</span>}
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>Décio Bazin</div>
              <div style={{
                fontSize: '44px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
                background: isBazinWinner ? gradGreen : gradPrice,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{fmt(result.precoBazin)}</div>
              <code style={{ fontFamily: 'Courier New', fontSize: '11px', color: 'var(--text3)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 10px', display: 'inline-block', marginTop: '12px' }}>DPA ÷ 0,06</code>
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '4px' }}>Margem de Segurança</div>
                <MarginVal val={result.mgBazin} />
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="glass-card" style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text3)', marginBottom: '8px' }}>🧭 Veredito Matemático</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text1)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: result.verdictText }} />
          </div>
        </div>
      )}

      {result?.negativeError && (
        <div className="alert-box red fade-up" style={{ marginTop: '24px' }}>
          <span style={{ fontSize: '19px', flexShrink: 0 }}>⚠️</span>
          <div>
            <div className="alert-title">Fórmula de Graham não aplicável</div>
            O VPA e o LPA precisam ser positivos para aplicar o método. Empresas com patrimônio negativo ou prejuízo não são avaliáveis por esta fórmula — utilize análise fundamentalista complementar.
          </div>
        </div>
      )}

      {!result && (
        <div className="placeholder">
          <div className="ph-icon">⚖️</div>
          <div className="ph-text">Preencha os dados da ação para comparar as metodologias de valuation.</div>
        </div>
      )}
    </div>
  )
}
