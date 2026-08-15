create table meal_food (
    id uuid primary key default gen_random_uuid(),
    meal_id uuid not null references meal(id) on delete cascade,
    food_id uuid not null references food(id) on delete cascade,
    unique(meal_id, food_id),
    portion_size_grams numeric not null,
    created_at timestamptz not null default now()
);
