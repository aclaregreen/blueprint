create table meal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  name text not null,
  created_at timestamptz not null default now()
);

alter table meal enable row level security;

create policy "Select own meal" on meal for
select
  using (auth.uid () = user_id);

create policy "Insert own meal" on meal for insert
with
  check (auth.uid () = user_id);

create policy "Update own meal" on meal
for update
  using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "Delete own meal" on meal for delete using (auth.uid () = user_id);

grant insert, update, delete on meal to authenticated;
