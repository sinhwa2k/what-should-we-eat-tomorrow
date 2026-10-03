create table dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  ingredients text,
  recipe text,
  memo text,
  created_at timestamptz not null default now()
);

create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  slot text not null check (slot in ('lunch', 'dinner')),
  unique (date, slot)
);

create table meal_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references meal_plans(id) on delete cascade,
  dish_id uuid references dishes(id) on delete set null,
  label text not null,
  position int not null default 0
);

create index on meal_items (plan_id);

-- no login: anon key may read/write. URL is the only secret.
alter table dishes enable row level security;
alter table meal_plans enable row level security;
alter table meal_items enable row level security;

create policy "anon all" on dishes for all to anon using (true) with check (true);
create policy "anon all" on meal_plans for all to anon using (true) with check (true);
create policy "anon all" on meal_items for all to anon using (true) with check (true);

-- photo bucket
insert into storage.buckets (id, name, public) values ('dish-photos', 'dish-photos', true);
create policy "anon photos" on storage.objects for all to anon
  using (bucket_id = 'dish-photos') with check (bucket_id = 'dish-photos');
