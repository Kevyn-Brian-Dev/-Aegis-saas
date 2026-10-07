# Aegis Investor Suite — SaaS Next.js 14

Ferramentas financeiras profissionais com login Google (Supabase) e paywall mensal (Stripe R$19,90).

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 App Router |
| Auth | Supabase (Google OAuth) |
| Banco | Supabase Postgres (RLS) |
| Pagamentos | Stripe Subscriptions |
| Estilo | CSS puro (dark dashboard) |
| Deploy | Vercel (recomendado) |

---

## Setup local (5 passos)

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com:

| Variável | Onde encontrar |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (secret) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys |
| `STRIPE_PRICE_ID` | Stripe → Products → criar produto R$19,90/mês → copiar Price ID |
| `STRIPE_WEBHOOK_SECRET` | Ver passo 4 |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (local) ou URL da Vercel |

### 3. Banco de dados Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Em **Authentication → Providers**, ative **Google** e configure o Client ID e Secret do [Google Cloud Console](https://console.cloud.google.com)
4. Em **Authentication → URL Configuration**, adicione:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Stripe Webhook (local)

Instale o [Stripe CLI](https://stripe.com/docs/stripe-cli) e rode:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie o `whsec_...` gerado e coloque em `STRIPE_WEBHOOK_SECRET`.

Eventos necessários no painel Stripe (produção):
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 5. Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000` → redireciona para `/login`.

---

## Fluxo do usuário

```
/ → redireciona
    ↓
/login → Google OAuth
    ↓
/auth/callback → troca code → cria sessão
    ↓
subscription_status == 'active'?
    ├── Não → /checkout → Stripe Checkout (R$19,90/mês)
    │              ↓
    │         webhook → profiles.subscription_status = 'active'
    │              ↓
    │         /checkout/success → /dashboard
    └── Sim → /dashboard/juros (módulo 1)
```

---

## Estrutura de pastas

```
aegis-saas/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login com Google
│   │   └── auth/callback/route.ts  # OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Guard: auth + subscription
│   │   └── dashboard/
│   │       ├── page.tsx            # Redirect → /juros
│   │       ├── juros/page.tsx
│   │       ├── fii/page.tsx
│   │       ├── graham/page.tsx
│   │       ├── allocation/page.tsx
│   │       └── pmedio/page.tsx
│   ├── checkout/
│   │   ├── page.tsx                # Paywall (server guard)
│   │   ├── checkout-client.tsx     # UI R$19,90
│   │   └── success/page.tsx
│   ├── api/stripe/
│   │   ├── checkout/route.ts       # Cria sessão Stripe
│   │   └── webhook/route.ts        # Processa eventos Stripe
│   ├── layout.tsx                  # Root layout + globals.css
│   └── page.tsx                    # Root redirect
├── components/
│   ├── dashboard-shell.tsx         # Sidebar + topbar (client)
│   └── modules/
│       ├── juros-compostos.tsx     # Módulo 1
│       ├── avaliador-fii.tsx       # Módulo 2
│       ├── radar-graham.tsx        # Módulo 3
│       ├── asset-allocation.tsx    # Módulo 4
│       └── preco-medio.tsx         # Módulo 5
├── lib/
│   ├── supabase/client.ts          # Browser client
│   ├── supabase/server.ts          # SSR client
│   ├── stripe.ts                   # Stripe singleton
│   ├── auth.ts                     # requireAuth, hasActiveSubscription
│   └── finance.ts                  # Todos os cálculos financeiros
├── types/database.ts               # Profile + Database types
├── styles/globals.css              # Dark dashboard CSS
├── supabase/schema.sql             # SQL: profiles table + triggers
├── middleware.ts                   # Route protection
└── .env.example                    # Template de variáveis
```

---

## Deploy (Vercel)

1. Push para GitHub
2. Importe no [Vercel](https://vercel.com)
3. Configure todas as env vars do `.env.example`
4. Atualize `NEXT_PUBLIC_APP_URL` para a URL da Vercel
5. No Supabase, adicione a URL de produção nos Redirect URLs
6. No Stripe, crie um webhook apontando para `https://seu-dominio.vercel.app/api/stripe/webhook`

---

## Cálculos financeiros preservados

| Método | Fórmula |
|--------|---------|
| Juros Compostos | `saldo = (saldo + jPer + mensal)` a cada mês |
| Graham | `√(22.5 × VPA × LPA)` |
| Bazin | `DPA ÷ 0.06` |
| Margem de segurança | `((precoTeto - cotacao) / cotacao) × 100` |
| FII Scoring | Base 50, ajustado por P/VP, DY e vacância por tipo |
| Preço Médio | `totalCapital / totalQtd` |
