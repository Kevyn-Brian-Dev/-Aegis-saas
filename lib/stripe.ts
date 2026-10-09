import Stripe from 'stripe'

/**
 * Singleton Stripe server client.
 * Only import this in server-side code (Route Handlers, Server Actions).
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
  typescript: true,
})

/** Price ID of the R$19,90/month plan, set in .env.local */
export const PRICE_ID = process.env.STRIPE_PRICE_ID!

/** Absolute URL helper — works in both local and production */
export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}${path}`
}
