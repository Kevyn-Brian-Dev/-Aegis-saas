'use client'

import { useState } from 'react'
import { avaliarFII, fmtN, fmtP, type FiiTipo, type BadgeVariant } from '@/lib/finance'

const TIPO_LABEL: Record<FiiTipo, string> = {
  tijolo: 'Tijolo (Shoppings, Galpões, Lajes)',
  papel:  'Papel (CRI, LCI, LCA)',
  dev:    'Desenvolvimento',
  fof:    'FoF — Fundo de Fundos',
}

export default function AvaliadorFII() {
  const [ticker, setTicker] = useState('')
  const [tipo,   setTipo]   = useState<FiiTipo>('tijolo')
  const [pvp,    setPvp]    = useState('')
  const [dy,     setDy]     = useState('')
  const [vac,    setVac]    = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [result, setResult] = useState<(ReturnType<typeof avaliarFII> & { ticker: string; pvp: number; dy: number | null; vac: number | null }) | null>(null)

  function validate() {
    const e: Record<string, boolean> = {}
    if (!ticker.trim()) e.ticker = true
    if (isNaN(parseFloat(pvp)) || parseFloat(pvp) <= 0) e.pvp = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function calculate() {
    if (!validate()) return
    const pvpN = parseFloat(pvp)
    const dyN  = dy  !== '' ? parseFloat(dy)  : null
    const vacN = vac !== '' ? parseFloat(vac) : null
    const res  = avaliarFII({ tipo, pvp: pvpN, dy: dyN, vac: vacN })
    setResult({ ...res, ticker: ticker.toUpperCase(), pvp: pvpN, dy: dyN, vac: vacN })
  }

  function clear() {
    setTicker(''); setPvp(''); setDy(''); setVac('')
    setTipo('tijolo'); setErrors({}); setResult(null)
  }

  const badgeStyle: Record<BadgeVariant, React.CSSProperties> = {
    green:  { background: 'var(--green-dim)',  color: 'var(--green)',  border: '1px solid rgba(0,230,118,.22)' },
    red:    { background: 'var(--red-dim)',    color: 'var(--red)',    border: '1px solid rgba(255,23,68,.22)' },
    cyan:   { background: 'var(--cyan-dim)',   color: 'var(--cyan)',   border: '1px solid rgba(0,229,255,.18)' },
    orange: { background: 'var(--orange-dim)', color: 'var(--orange)', border: '1px solid rgba(255,145,0,.22)' },
    yellow: { background: 'rgba(255,229,127,.1)', color: 'var(--yellow)', border: '1px solid rgba(255,229,127,.2)' },
    purple: { background: 'rgba(124,77,255,.12)', color: 'var(--purple)', border: '1px solid rgba(124,77,255,.22)' },
  }

  const dotColor: Record<BadgeVariant, string> = {
    green: 'var(--green)', red: 'var(--red)', cyan: 'var(--cyan)',
    orange: 'var(--orange)', yellow: 'var(--yellow)', purple: 'var(--purple)',
  }

  const pvpColor = result
    ? result.pvp < 1 ? 'var(--green)' : result.pvp <= 1.05 ? 'var(--cyan)' : 'var(--orange)'
    : 'var(--text1)'

  const progColorMap: Record<string, string> = {
    green: 'linear-gradient(135deg,#00e676,#1de9b6)',
    orange: 'linear-gradient(90deg,#ff9100,#ff6d00)',
    red:   'linear-gradient(90deg,#ff1744,#d50000)',
    cyan:  'linear-gradient(135deg,#0072ff,#00e5ff)',
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.9px', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '8px' }}>
          <span style={{ width: '14px', height: '2px', background: 'linear-gradient(135deg,#0072ff,#00e5ff)', display: 'inline-block', borderRadius: '2px' }} />
          Avaliação
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-.5px' }}>Avaliador Multi-Critérios de FIIs</h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '5px' }}>Pontuação inteligente adaptada ao tipo do fundo: Tijolo, Papel, Desenvolvimento ou FoF.</p>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>Ticker do FII</label>
            <input
              className={`form-input${errors.ticker ? ' error' : ''}`}
              type="text" value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Ex: MXRF11" maxLength={8}
              onKeyDown={e => e.key === 'Enter' && calculate()}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>Tipo de FII</label>
            <select className="styled-select" value={tipo} onChange={e => setTipo(e.target.value as FiiTipo)} style={{ width: '100%' }}>
              {(Object.entries(TIPO_LABEL) as [FiiTipo, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>P/VP Atual</label>
            <input
              className={`form-input${errors.pvp ? ' error' : ''}`}
              type="number" value={pvp}
              onChange={e => setPvp(e.target.value)}
              placeholder="Ex: 0.95" step="any"
              onKeyDown={e => e.key === 'Enter' && calculate()}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>Dividend Yield (%/12m)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none' }}>%</span>
              <input className="form-input pre" type="number" value={dy} onChange={e => setDy(e.target.value)} placeholder="Ex: 8.5" step="any" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text2)' }}>Vacância Física (%)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', pointerEvents: 'none' }}>%</span>
              <input className="form-input pre" type="number" value={vac} onChange={e => setVac(e.target.value)} placeholder="Ex: 6" step="any" min={0} max={100} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={calculate}>✦ Avaliar FII</button>
          <button className="btn btn-ghost" onClick={clear}>Limpar</button>
        </div>
      </div>

      {result && (
        <div className="glass-card fade-up" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Fundo Imobiliário</div>
              <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-.5px' }}>{result.ticker}</div>
              <div style={{ marginTop: '8px' }}>
                <span className={`badge badge-cyan`} style={{ fontSize: '12px' }}>
                  <span className="bd" />{TIPO_LABEL[tipo]}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)', marginBottom: '6px' }}>Veredito</div>
              <span className="badge" style={{ ...badgeStyle[result.badgeVariant], fontSize: '14px', padding: '8px 16px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: dotColor[result.badgeVariant], boxShadow: `0 0 6px ${dotColor[result.badgeVariant]}`, flexShrink: 0, display: 'inline-block' }} />
                {result.veredito}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', margin: '20px 0 14px' }}>
            {[
              { label: 'P/VP', val: fmtN(result.pvp), color: pvpColor },
              { label: 'DY 12M', val: result.dy !== null ? fmtP(result.dy) : '—', color: 'var(--green)' },
              { label: 'Vacância', val: result.vac !== null ? fmtP(result.vac) : '—',
                color: result.vac !== null ? (result.vac < 10 ? 'var(--green)' : result.vac < 20 ? 'var(--orange)' : 'var(--red)') : 'var(--text2)' },
            ].map(k => (
              <div key={k.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)', marginBottom: '4px' }}>{k.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', marginBottom: '5px' }}>
              <span>Atratividade do Fundo</span>
              <span>{result.score}%</span>
            </div>
            <div className="prog-track">
              <div style={{ height: '100%', borderRadius: '99px', transition: 'width .6s cubic-bezier(.4,0,.2,1)', background: progColorMap[result.progVariant] || 'var(--grad-green)', width: `${result.score}%` }} />
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: result.analise }} />
          {result.nota && (
            <div className="note" style={{ marginTop: '16px' }} dangerouslySetInnerHTML={{ __html: '<strong>ℹ️ Nota:</strong> ' + result.nota }} />
          )}
        </div>
      )}

      {!result && (
        <div className="placeholder">
          <div className="ph-icon">🏢</div>
          <div className="ph-text">Preencha o formulário para obter o diagnóstico completo do FII.</div>
        </div>
      )}
    </div>
  )
}
