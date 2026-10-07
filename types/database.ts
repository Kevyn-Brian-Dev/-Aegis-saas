/**
 * Supabase database type definitions.
 * The `profiles` table is created/maintained by the SQL schema in
 * supabase/schema.sql and kept in sync by the DB webhook trigger.
 */

export interface Profile {
  id: string                         // UUID — matches auth.users.id
  email: string
  full_name: string | null
  avatar_url: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
  subscription_period_end: string | null  // ISO timestamp
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string; email: string }
        Update: Partial<Profile>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
