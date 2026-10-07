-- ============================================================
-- Aegis Investor Suite — Supabase SQL Schema
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<id>/sql/new
-- ============================================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  email                     text not null,
  full_name                 text,
  avatar_url                text,
  stripe_customer_id        text unique,
  stripe_subscription_id    text unique,
  subscription_status       text check (
    subscription_status in ('active', 'canceled', 'past_due', 'trialing')
  ),
  subscription_period_end   timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- 2. Row Level Security
alter table public.profiles enable row level security;

-- Users can only read/write their own profile
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Service role can do anything (needed by Stripe webhook)
create policy "profiles: service all" on public.profiles
  for all using (auth.role() = 'service_role');

-- 3. Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- 5. Index on stripe_customer_id for webhook lookups
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles(stripe_customer_id);
