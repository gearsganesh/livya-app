-- LIVYA Smart App database
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client','admin','clinician')),
  phone text,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  record_type text not null,
  title text not null,
  value numeric,
  unit text,
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  clinician_id uuid references public.profiles(id) on delete set null,
  service text not null,
  starts_at timestamptz not null,
  status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.programmes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration_days int,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.user_programmes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  started_at timestamptz not null default now(),
  progress numeric not null default 0,
  status text not null default 'active'
);

create table if not exists public.vital_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric text not null,
  reading numeric,
  unit text,
  severity text not null default 'info',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.health_records enable row level security;
alter table public.appointments enable row level security;
alter table public.programmes enable row level security;
alter table public.user_programmes enable row level security;
alter table public.vital_alerts enable row level security;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','clinician')); $$;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (id=auth.uid() or public.is_staff());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using (id=auth.uid());

drop policy if exists "health own or staff read" on public.health_records;
create policy "health own or staff read" on public.health_records for select using (user_id=auth.uid() or public.is_staff());

drop policy if exists "health staff write" on public.health_records;
create policy "health staff write" on public.health_records for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "appointments own or staff" on public.appointments;
create policy "appointments own or staff" on public.appointments for select using (user_id=auth.uid() or clinician_id=auth.uid() or public.is_staff());

drop policy if exists "appointments staff write" on public.appointments;
create policy "appointments staff write" on public.appointments for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "programmes read" on public.programmes;
create policy "programmes read" on public.programmes for select using (true);

drop policy if exists "programmes staff write" on public.programmes;
create policy "programmes staff write" on public.programmes for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "user programmes own or staff" on public.user_programmes;
create policy "user programmes own or staff" on public.user_programmes for select using (user_id=auth.uid() or public.is_staff());

drop policy if exists "user programmes staff write" on public.user_programmes;
create policy "user programmes staff write" on public.user_programmes for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "alerts own or staff" on public.vital_alerts;
create policy "alerts own or staff" on public.vital_alerts for select using (user_id=auth.uid() or public.is_staff());

drop policy if exists "alerts staff write" on public.vital_alerts;
create policy "alerts staff write" on public.vital_alerts for all using (public.is_staff()) with check (public.is_staff());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.programmes(name,description,duration_days) values
('Metabolic Reset','Personalised metabolic health programme',90),
('Nutrition Programme','Guided nutrition and lifestyle support',30),
('Movement & Fitness','Progressive movement programme',30),
('Sleep Optimisation','Sleep and recovery support',30)
on conflict do nothing;
