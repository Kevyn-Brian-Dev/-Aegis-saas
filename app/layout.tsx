import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Aegis Investor Suite',
  description: 'Ferramentas financeiras profissionais: Juros Compostos, Avaliador de FIIs, Preço Teto Graham/Bazin, Asset Allocation e Preço Médio.',
  keywords: ['investimentos', 'FII', 'Graham', 'Bazin', 'juros compostos', 'carteira'],
  openGraph: {
    title: 'Aegis Investor Suite',
    description: 'Ferramentas financeiras profissionais para investidores sérios.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
