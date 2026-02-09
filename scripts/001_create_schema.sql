-- ============================================
-- Lyftr Database Schema
-- ============================================

-- 1. Profiles (user settings + current weights)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  unit text not null default 'lbs',
  squat_weight numeric not null default 135,
  bench_weight numeric not null default 95,
  press_weight numeric not null default 65,
  deadlift_weight numeric not null default 225,
  next_workout_type text not null default 'A',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 2. Workouts (one row per session)
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  date timestamptz not null default now(),
  duration_minutes integer,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_workouts_user_date on public.workouts(user_id, date desc);

alter table public.workouts enable row level security;
create policy "workouts_select_own" on public.workouts for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts for update using (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts for delete using (auth.uid() = user_id);

-- 3. Workout sets (one row per set)
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  set_number integer not null,
  weight numeric not null,
  target_reps integer not null,
  completed_reps integer,
  rpe numeric,
  is_warmup boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_sets_workout on public.workout_sets(workout_id);
create index if not exists idx_sets_user_exercise on public.workout_sets(user_id, exercise_id);

alter table public.workout_sets enable row level security;
create policy "sets_select_own" on public.workout_sets for select using (auth.uid() = user_id);
create policy "sets_insert_own" on public.workout_sets for insert with check (auth.uid() = user_id);
create policy "sets_update_own" on public.workout_sets for update using (auth.uid() = user_id);
create policy "sets_delete_own" on public.workout_sets for delete using (auth.uid() = user_id);

-- 4. Exercise notes (per-exercise text notes for AI coach context)
create table if not exists public.exercise_notes (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_notes_user on public.exercise_notes(user_id, created_at desc);

alter table public.exercise_notes enable row level security;
create policy "notes_select_own" on public.exercise_notes for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.exercise_notes for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.exercise_notes for update using (auth.uid() = user_id);
create policy "notes_delete_own" on public.exercise_notes for delete using (auth.uid() = user_id);
