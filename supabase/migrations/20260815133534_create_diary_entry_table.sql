create table diary_entry (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    food_id uuid not null references food(id) on delete restrict,
    meal_id uuid references meal(id) on delete set null,
    portion_size_grams numeric not null,
    calories numeric not null,
    fats numeric not null,
    carbs numeric not null,
    protein numeric not null,
    logged_at timestamptz not null default now()
);