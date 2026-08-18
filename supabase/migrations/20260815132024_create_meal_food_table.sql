create table meal_food (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meal (id) on delete cascade,
  food_id uuid not null references food (id) on delete cascade,
  unique (meal_id, food_id),
  portion_size_grams numeric not null,
  created_at timestamptz not null default now()
);

alter table meal_food enable row level security;

create policy "Select own meal food" on meal_food for
select
  using (
    exists (
      select
        1
      from
        meal
      where
        meal.id = meal_food.meal_id
        and meal.user_id = auth.uid ()
    )
  );

create policy "Insert own meal food" on meal_food for insert
with
  check (
    exists (
      select
        1
      from
        meal
      where
        meal.id = meal_food.meal_id
        and meal.user_id = auth.uid ()
    )
  );

create policy "Update own meal food" on meal_food
for update
  using (
    exists (
      select
        1
      from
        meal
      where
        meal.id = meal_food.meal_id
        and meal.user_id = auth.uid ()
    )
  )
with
  check (
    exists (
      select
        1
      from
        meal
      where
        meal.id = meal_food.meal_id
        and meal.user_id = auth.uid ()
    )
  );

create policy "Delete own meal food" on meal_food for delete using (
  exists (
    select
      1
    from
      meal
    where
      meal.id = meal_food.meal_id
      and meal.user_id = auth.uid ()
  )
);

grant insert, update, delete on meal_food to authenticated;
