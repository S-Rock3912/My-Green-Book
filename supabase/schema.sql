-- =========================================================
-- My Yardage Book - Supabase Schema
-- =========================================================
-- 実行方法: Supabase Dashboard > SQL Editor に貼り付けて実行

-- ── Extensions ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Courses ─────────────────────────────────────────────
create table if not exists courses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade,
  name       text not null,
  location   text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table courses enable row level security;
create policy "Users can manage their own courses"
  on courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Holes ────────────────────────────────────────────────
create table if not exists holes (
  id                   uuid primary key default gen_random_uuid(),
  course_id            uuid not null references courses(id) on delete cascade,
  number               int not null check (number between 1 and 18),
  par                  int not null default 4 check (par in (3, 4, 5)),
  handicap             int not null default 1 check (handicap between 1 and 18),
  total_distance       int not null default 350 check (total_distance > 0),
  num_waypoints        int not null default 2 check (num_waypoints between 0 and 4),

  -- Course diagram
  course_image_url     text,         -- Supabase Storage URL
  drawing_shapes       jsonb not null default '[]',
  markers              jsonb not null default '{"tee":null,"pin":null,"waypoints":[]}',

  -- Green
  green_image_url      text,
  green_drawing_shapes jsonb not null default '[]',
  green_front_distance int,
  green_center_distance int,
  green_back_distance  int,
  pin_positions        jsonb not null default '[]',
  active_pin_position_id text,

  -- Memo
  memo_wind_direction  text not null default '',
  memo_target_line     text not null default '',
  memo_danger_area     text not null default '',
  memo_notes           text not null default '',

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  unique (course_id, number)
);

-- RLS (courses経由で制御)
alter table holes enable row level security;
create policy "Users can manage holes in their courses"
  on holes for all
  using (
    exists (
      select 1 from courses c
      where c.id = holes.course_id and c.user_id = auth.uid()
    )
  );

-- ── Storage Buckets ──────────────────────────────────────
-- Supabase Dashboard > Storage で作成するか、以下を実行:
insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('green-images', 'green-images', false)
on conflict (id) do nothing;

-- Storage RLS
create policy "Authenticated users can upload course images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-images');

create policy "Authenticated users can read course images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'course-images');

create policy "Authenticated users can upload green images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'green-images');

create policy "Authenticated users can read green images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'green-images');

-- ── User State (JSON blob sync) ──────────────────────────
-- courses/holes を丸ごと JSON で保存するシンプルな同期テーブル
create table if not exists user_state (
  user_id    uuid primary key references auth.users on delete cascade,
  state_json jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table user_state enable row level security;
create policy "Users can manage their own state"
  on user_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Auto-update updated_at ───────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger courses_updated_at
  before update on courses
  for each row execute function update_updated_at();

create trigger holes_updated_at
  before update on holes
  for each row execute function update_updated_at();

create trigger user_state_updated_at
  before update on user_state
  for each row execute function update_updated_at();
