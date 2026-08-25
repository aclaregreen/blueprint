create table food (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  name text not null,
  serving_size_grams numeric not null,
  calories numeric generated always as (protein * 4 + carbs * 4 + fats * 9) stored,
  fats numeric not null,
  carbs numeric not null,
  protein numeric not null,
  created_at timestamptz not null default now()
);

alter table food enable row level security;

create policy "Select own food" on food for
select
  using (auth.uid () = user_id);

create policy "Insert own food" on food for insert
with
  check (auth.uid () = user_id);

create policy "Update own food" on food
for update
  using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "Delete own food" on food for delete using (auth.uid () = user_id);

grant insert, update, delete on food to authenticated;
