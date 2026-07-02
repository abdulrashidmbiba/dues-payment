-- ============================================================
-- NexisPay Database Schema
-- Run this entire file in Supabase SQL Editor (one paste, run once)
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  member_id text unique,                -- e.g. NEX-2026-001
  full_name text not null,
  index_number text,
  program text,
  level text,
  phone text,
  email text unique not null,
  role text not null default 'member',  -- 'member' | 'treasurer' | 'admin'
  created_at timestamptz default now()
);

-- 2. DUES CATEGORIES
-- ------------------------------------------------------------
create table public.dues_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,                   -- 'Semester Dues', 'Department Dues', 'Club Dues'
  amount numeric not null,
  due_date date,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. PAYMENTS
-- ------------------------------------------------------------
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.dues_categories(id),
  amount numeric not null,
  paystack_reference text unique,
  status text not null default 'pending', -- 'pending' | 'success' | 'failed'
  receipt_number text unique,
  paid_at timestamptz default now()
);

-- 4. COMMUNITY IMPACT PROJECTS (Unique Feature #1)
-- ------------------------------------------------------------
create table public.community_projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,                  -- 'Projector Purchase'
  description text,
  target_amount numeric not null,
  raised_amount numeric default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- AUTO-GENERATE MEMBER ID (NEX-2026-001, NEX-2026-002, ...)
-- ============================================================
create sequence if not exists member_id_seq start 1;

create or replace function public.generate_member_id()
returns trigger as $$
begin
  new.member_id := 'NEX-' || extract(year from now())::text || '-' ||
                    lpad(nextval('member_id_seq')::text, 3, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_member_id
before insert on public.profiles
for each row
when (new.member_id is null)
execute function public.generate_member_id();

-- ============================================================
-- AUTO-GENERATE RECEIPT NUMBER ON SUCCESSFUL PAYMENT
-- ============================================================
create sequence if not exists receipt_seq start 1;

create or replace function public.generate_receipt_number()
returns trigger as $$
begin
  if new.status = 'success' and new.receipt_number is null then
    new.receipt_number := 'RCT-' || to_char(now(), 'YYYYMMDD') || '-' ||
                           lpad(nextval('receipt_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_receipt_number
before insert or update on public.payments
for each row
execute function public.generate_receipt_number();

-- ============================================================
-- KEEP COMMUNITY PROJECT TOTALS IN SYNC (optional, manual for now)
-- Admin/treasurer update raised_amount directly for tonight's demo.
-- ============================================================

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.dues_categories enable row level security;
alter table public.payments enable row level security;
alter table public.community_projects enable row level security;

-- Helper: is the current user a treasurer or admin?
create or replace function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('treasurer', 'admin')
  );
$$ language sql stable;

-- Profiles: users see their own row; staff see all
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.is_staff());

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_staff());

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- Dues categories: everyone logged in can read; only staff can write
create policy "dues_categories_select" on public.dues_categories
  for select using (auth.role() = 'authenticated');

create policy "dues_categories_staff_write" on public.dues_categories
  for insert with check (public.is_staff());

create policy "dues_categories_staff_update" on public.dues_categories
  for update using (public.is_staff());

-- Payments: members see their own; staff see all
create policy "payments_self_select" on public.payments
  for select using (member_id = auth.uid() or public.is_staff());

create policy "payments_self_insert" on public.payments
  for insert with check (member_id = auth.uid() or public.is_staff());

create policy "payments_staff_update" on public.payments
  for update using (public.is_staff());

-- Community projects: everyone logged in can read; only staff can write
create policy "projects_select" on public.community_projects
  for select using (auth.role() = 'authenticated');

create policy "projects_staff_write" on public.community_projects
  for insert with check (public.is_staff());

create policy "projects_staff_update" on public.community_projects
  for update using (public.is_staff());

-- ============================================================
-- SEED DATA (safe to run — edit values, then run once)
-- ============================================================
insert into public.dues_categories (name, amount, due_date) values
  ('Semester Dues', 50, current_date + interval '12 days'),
  ('Department Dues', 30, current_date + interval '20 days'),
  ('Club Dues', 20, current_date + interval '30 days');

insert into public.community_projects (title, description, target_amount, raised_amount) values
  ('Projector Purchase', 'New projector for department seminars', 2000, 1400),
  ('Classroom Repair', 'Fixing broken chairs and windows', 1500, 675);
