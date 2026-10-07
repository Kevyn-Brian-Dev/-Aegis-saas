/**
 * Pure financial calculation functions.
 * No React, no DOM — safe to test in isolation.
 * These are the exact algorithms ported from aegis.html.
 */

export const clamp = (v: number, mn: number, mx: number) =>
  Math.min(Math.max(v, mn), mx)

// ─── Formatters ─────────────────────────────────────────────────────────────

export function fmt(value: number): string {
  if (isNaN(value)) return 'R$ —'
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function fmtN(value: number, decimals = 2): string {
  if (isNaN(value)) return '—'
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtP(value: number): string {
  if (isNaN(value)) return '—'
  return fmtN(value, 2) + '%'
}

// ─── Module 1: Juros Compostos ───────────────────────────────────────────────

export interface JurosRow {
  periodo: number
  aporte: number
  jurosPeriodo: number
  jurosAcumulados: number
  totalAcumulado: number
}

export interface JurosResult {
  totalInvestido: number
  totalJuros: number
  patrimonioFinal: number
  poderDeCompra: number
  rows: JurosRow[]
}

export function calcularJuros(params: {
  inicial: number
  mensal: number
  taxa: number
  taxaTipo: 'aa' | 'am'
  periodo: number
  periodoTipo: 'anos' | 'meses'
  inflacao: number
}): JurosResult {
  const { inicial, mensal, taxa, taxaTipo, periodo, periodoTipo, inflacao } = params

  const taxaMensal =
    taxaTipo === 'aa'
      ? Math.pow(1 + taxa / 100, 1 / 12) - 1
      : taxa / 100

  const totalMeses = periodoTipo === 'anos' ? periodo * 12 : periodo

  let saldo = inicial
  let totalInvestido = inicial
  let jurosAcumulados = 0
  const rows: JurosRow[] = []

  rows.push({ periodo: 0, aporte: inicial, jurosPeriodo: 0, jurosAcumulados: 0, totalAcumulado: inicial })

  for (let m = 1; m <= totalMeses; m++) {
    const jPer = saldo * taxaMensal
    saldo = saldo + jPer + mensal
    totalInvestido += mensal
    jurosAcumulados += jPer
    rows.push({ periodo: m, aporte: mensal, jurosPeriodo: jPer, jurosAcumulados, totalAcumulado: saldo })
  }

  const taxaInflMensal = Math.pow(1 + inflacao / 100, 1 / 12) - 1
  const fatorInflacao = inflacao > 0 ? Math.pow(1 + taxaInflMensal, totalMeses) : 1
  const poderDeCompra = saldo / fatorInflacao

  return { totalInvestido, totalJuros: jurosAcumulados, patrimonioFinal: saldo, poderDeCompra, rows }
}

// ─── Module 2: FII ───────────────────────────────────────────────────────────

export type FiiTipo = 'tijolo' | 'papel' | 'dev' | 'fof'
export type BadgeVariant = 'green' | 'red' | 'cyan' | 'orange' | 'yellow' | 'purple'

export interface FiiResult {
  score: number
  veredito: string
  badgeVariant: BadgeVariant
  progVariant: 'green' | 'orange' | 'red' | 'cyan'
  analise: string
  nota: string
}

export function avaliarFII(params: {
  tipo: FiiTipo
  pvp: number
  dy: number | null
  vac: number | null
}): FiiResult {
  const { tipo, pvp, dy, vac } = params
  let score = 50
  let veredito = ''
  let badgeVariant: BadgeVariant = 'cyan'
  let progVariant: 'green' | 'orange' | 'red' | 'cyan' = 'cyan'
  let analise = ''
  let nota = ''

  if (tipo === 'tijolo') {
    if (pvp < 0.85) score += 30
    else if (pvp < 1.0) score += 18
    else if (pvp <= 1.05) score += 5
    else if (pvp <= 1.15) score -= 8
    else score -= 22

    if (dy !== null) {
      if (dy >= 9) score += 15
      else if (dy >= 7) score += 8
      else if (dy >= 5) score += 2
      else score -= 8
    }

    if (vac !== null) {
      if (vac < 5) score += 12
      else if (vac < 10) score += 6
      else if (vac < 20) score -= 5
      else score -= 18
    }

    score = clamp(score, 0, 100)

    if (pvp < 1.0 && vac !== null && vac < 10) {
      veredito = 'Excelente Oportunidade'; badgeVariant = 'green'; progVariant = 'green'
    } else if (vac !== null && vac > 20) {
      veredito = 'Risco de Vacância Alto'; badgeVariant = 'orange'; progVariant = 'orange'
    } else if (pvp > 1.15) {
      veredito = 'Caro / Sobrevalorizado'; badgeVariant = 'red'; progVariant = 'red'
    } else if (pvp < 1.0) {
      veredito = 'Desconto no P/VP'; badgeVariant = 'green'; progVariant = 'green'
    } else {
      veredito = 'Neutro / Acompanhar'; badgeVariant = 'cyan'; progVariant = 'cyan'
    }

    analise = `Fundo do tipo <strong>Tijolo</strong>. P/VP de <strong>${fmtN(pvp)}</strong> indica ${pvp < 1 ? 'desconto' : 'ágio'} em relação ao valor patrimonial.`
    if (dy !== null) analise += ` Dividend Yield de <strong>${fmtP(dy)}</strong> nos últimos 12 meses.`
    if (vac !== null) analise += ` Vacância física de <strong>${fmtP(vac)}</strong> — ${vac < 10 ? 'dentro de parâmetros saudáveis.' : vac < 20 ? 'nível de atenção moderado.' : 'nível crítico, eleva o risco do fundo.'}`
    nota = '<strong>Fundos de tijolo</strong>: vacância acima de 10% começa a comprometer a distribuição de dividendos. Avalie o contrato dos inquilinos e o segmento (shoppings, galpões, lajes).'

  } else if (tipo === 'papel') {
    if (pvp < 0.95) score = 88
    else if (pvp <= 1.0) score = 72
    else if (pvp <= 1.05) score = 52
    else if (pvp <= 1.1) score = 32
    else score = 14

    if (dy !== null) {
      if (dy >= 11) score = Math.min(score + 12, 100)
      else if (dy >= 8) score = Math.min(score + 5, 100)
    }

    score = clamp(score, 0, 100)

    if (pvp < 0.95) { veredito = 'Desconto Atraente'; badgeVariant = 'green'; progVariant = 'green' }
    else if (pvp <= 1.0) { veredito = 'Preço Justo'; badgeVariant = 'cyan'; progVariant = 'cyan' }
    else if (pvp <= 1.05) { veredito = 'Leve Ágio'; badgeVariant = 'yellow'; progVariant = 'orange' }
    else { veredito = 'Risco de Ágio Alto'; badgeVariant = 'red'; progVariant = 'red' }

    analise = `Fundo de <strong>Papel</strong>. Para esta categoria, o P/VP é o critério dominante. P/VP de <strong>${fmtN(pvp)}</strong> ${pvp > 1.05 ? 'indica ágio relevante — risco de perda patrimonial se as cotas caírem.' : 'está em nível razoável para o tipo.'}.`
    nota = '<strong>FIIs de Papel</strong>: P/VP acima de 1,05 eleva o risco, pois a cota pode convergir para o valor patrimonial. O DY elevado pode ser reflexo de alta do CDI/IPCA e não necessariamente de geração de caixa superior.'

  } else if (tipo === 'dev') {
    if (pvp < 0.8) score = 80
    else if (pvp < 1.0) score = 60
    else if (pvp <= 1.2) score = 40
    else score = 20

    score = clamp(score, 0, 100)
    veredito = pvp < 0.9 ? 'Desconto em Desenvolvimento' : pvp < 1.1 ? 'Risco Moderado' : 'Risco Elevado'
    badgeVariant = pvp < 0.9 ? 'green' : pvp < 1.1 ? 'yellow' : 'red'
    progVariant = pvp < 0.9 ? 'green' : pvp < 1.1 ? 'orange' : 'red'
    analise = `Fundo de <strong>Desenvolvimento</strong>. Apresentam maior risco e menor liquidez. P/VP de <strong>${fmtN(pvp)}</strong>. Avaliar prazo de entrega, reputação da gestora e patrimônio comprometido.`
    nota = '<strong>FIIs de Desenvolvimento</strong>: rentabilidade concentrada no evento de venda dos imóveis. Risco maior que tijolo e papel. Indicado para investidores com maior tolerância a risco.'

  } else {
    // fof
    if (pvp < 0.9) score = 75
    else if (pvp <= 1.0) score = 60
    else if (pvp <= 1.1) score = 42
    else score = 22

    if (dy !== null) {
      if (dy >= 9) score = Math.min(score + 10, 100)
      else if (dy >= 7) score = Math.min(score + 4, 100)
    }

    score = clamp(score, 0, 100)
    veredito = pvp < 0.95 ? 'Desconto Atraente' : pvp <= 1.05 ? 'Preço Neutro' : 'Ágio — Cautela'
    badgeVariant = pvp < 0.95 ? 'green' : pvp <= 1.05 ? 'cyan' : 'orange'
    progVariant = pvp < 0.95 ? 'green' : pvp <= 1.05 ? 'cyan' : 'orange'
    analise = `<strong>FoF</strong> (Fundo de Fundos). P/VP de <strong>${fmtN(pvp)}</strong>. Avalie o portfólio interno, o nível de diversificação e a dupla cobrança de taxas de administração.`
    nota = '<strong>FoFs</strong>: o investidor paga taxa de administração duas vezes (do FoF e dos fundos internos). Verifique se a diversificação adicional compensa o custo.'
  }

  return { score, veredito, badgeVariant, progVariant, analise, nota }
}

// ─── Module 3: Graham + Bazin ─────────────────────────────────────────────────

export interface GrahamResult {
  precoGraham: number
  precoBazin: number
  mgGraham: number | null  // % margin of safety
  mgBazin: number | null
  winner: 'graham' | 'bazin' | 'tie'
  verdictText: string
  negativeError: boolean
}

export function calcularGrahamBazin(params: {
  ticker: string
  vpa: number
  lpa: number
  div: number
  cotacao: number | null
}): GrahamResult {
  const { ticker, vpa, lpa, div, cotacao } = params

  if (vpa <= 0 || lpa <= 0) {
    return {
      precoGraham: 0, precoBazin: 0,
      mgGraham: null, mgBazin: null,
      winner: 'tie', verdictText: '', negativeError: true,
    }
  }

  // ── Core formulas — never change these ──────────────────────────────────────
  const precoGraham = Math.sqrt(22.5 * vpa * lpa)  // Graham
  const precoBazin  = div / 0.06                    // Bazin: DPA ÷ 6%
  // ────────────────────────────────────────────────────────────────────────────

  const hasCot = cotacao !== null && cotacao > 0
  const mgGraham = hasCot ? ((precoGraham - cotacao!) / cotacao!) * 100 : null
  const mgBazin  = hasCot ? ((precoBazin  - cotacao!) / cotacao!) * 100 : null

  let winner: 'graham' | 'bazin' | 'tie' = 'tie'
  let verdictText = ''

  if (hasCot && mgGraham !== null && mgBazin !== null) {
    if (mgGraham > mgBazin) {
      winner = 'graham'
      const diff = Math.abs(mgGraham - mgBazin)
      verdictText = `Com a cotação atual de <strong>${fmt(cotacao!)}</strong> para <strong>${ticker}</strong>, o método de <strong>Graham</strong> oferece a maior margem de segurança (<strong>${mgGraham >= 0 ? '+' : ''}${fmtN(mgGraham)}%</strong> vs ${fmtN(mgBazin)}% do Bazin), diferencial de ${fmtN(diff)}pp. ${mgGraham > 0 ? 'A ação está abaixo do preço teto — potencial de valorização identificado.' : 'Cotação acima do preço teto de Graham — risco de pagar caro pelo ativo.'}`
    } else if (mgBazin > mgGraham) {
      winner = 'bazin'
      const diff = Math.abs(mgBazin - mgGraham)
      verdictText = `Com a cotação atual de <strong>${fmt(cotacao!)}</strong> para <strong>${ticker}</strong>, o método de <strong>Bazin</strong> oferece a maior margem de segurança (<strong>${mgBazin >= 0 ? '+' : ''}${fmtN(mgBazin)}%</strong> vs ${fmtN(mgGraham)}% do Graham), diferencial de ${fmtN(diff)}pp. ${mgBazin > 0 ? 'O dividendo histórico justifica o preço teto mais elevado.' : 'Cotação acima do preço teto de Bazin — rendimento de dividendos abaixo do exigido de 6%.'}`
    } else {
      winner = 'tie'
      verdictText = `Ambos os métodos apontam margem de segurança idêntica de <strong>${fmtN(mgGraham)}%</strong> com a cotação de <strong>${fmt(cotacao!)}</strong>. Raríssima convergência — sinal matemático forte.`
    }
  } else {
    winner = precoGraham >= precoBazin ? 'graham' : 'bazin'
    const vencedorNome = winner === 'graham' ? 'Graham' : 'Bazin'
    const vencedorPreco = winner === 'graham' ? precoGraham : precoBazin
    verdictText = `Sem cotação atual informada, o método de <strong>${vencedorNome}</strong> resulta no preço teto mais elevado para <strong>${ticker}</strong> (${fmt(vencedorPreco)}). Insira a cotação atual para calcular a margem de segurança precisa.`
  }

  return { precoGraham, precoBazin, mgGraham, mgBazin, winner, verdictText, negativeError: false }
}

// ─── Module 4: Asset Allocation ──────────────────────────────────────────────

export const ALLOC_CLASSES = [
  { id: 'acoes', label: 'Ações',      color: '#00e5ff' },
  { id: 'fiis',  label: 'FIIs',       color: '#00e676' },
  { id: 'rf',    label: 'Renda Fixa', color: '#ff9100' },
  { id: 'cx',    label: 'Caixa',      color: '#7c4dff' },
] as const

export type AllocId = (typeof ALLOC_CLASSES)[number]['id']

export interface AllocResult {
  atualPct: Record<AllocId, number>
  desvios: Array<{ id: AllocId; label: string; color: string; alvo: number; atual: number; dev: number; valor: number }>
  rebalClass: AllocId | null
  rebalLabel: string
  rebalDesvio: number
  totalAtual: number
}

export function calcularAlloc(
  alvo: Record<AllocId, number>,
  atual: Record<AllocId, number>
): AllocResult {
  const totalAtual = ALLOC_CLASSES.reduce((s, c) => s + (atual[c.id] ?? 0), 0)

  const atualPct = {} as Record<AllocId, number>
  ALLOC_CLASSES.forEach(c => {
    atualPct[c.id] = totalAtual > 0 ? ((atual[c.id] ?? 0) / totalAtual) * 100 : 0
  })

  let maxDesvio = -Infinity
  let rebalClass: AllocId | null = null
  let rebalLabel = ''

  const desvios = ALLOC_CLASSES.map(c => {
    const dev = (alvo[c.id] ?? 0) - atualPct[c.id]
    if (dev > maxDesvio) { maxDesvio = dev; rebalClass = c.id; rebalLabel = c.label }
    return { id: c.id, label: c.label, color: c.color, alvo: alvo[c.id] ?? 0, atual: atualPct[c.id], dev, valor: atual[c.id] ?? 0 }
  })

  return { atualPct, desvios, rebalClass, rebalLabel, rebalDesvio: maxDesvio, totalAtual }
}

// ─── Module 5: Preço Médio ────────────────────────────────────────────────────

export interface Lote {
  qtd: number
  preco: number
}

export interface PMedioResult {
  precoMedio: number
  totalQtd: number
  totalCapital: number
  lotes: Array<{ idx: number; qtd: number; preco: number; total: number; pct: number }>
}

export function calcularPMedio(lotes: Lote[]): PMedioResult | null {
  let totalQtd = 0
  let totalCapital = 0
  const valid: Array<{ idx: number; qtd: number; preco: number; total: number; pct: number }> = []

  lotes.forEach((l, i) => {
    if (l.qtd > 0 && l.preco > 0) {
      const t = l.qtd * l.preco
      totalQtd += l.qtd
      totalCapital += t
      valid.push({ idx: i + 1, qtd: l.qtd, preco: l.preco, total: t, pct: 0 })
    }
  })

  if (totalQtd <= 0 || totalCapital <= 0) return null

  valid.forEach(v => { v.pct = (v.total / totalCapital) * 100 })

  return { precoMedio: totalCapital / totalQtd, totalQtd, totalCapital, lotes: valid }
}
