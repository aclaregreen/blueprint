create table food (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    serving_size_grams numeric not null,
    calories numeric not null,
    fats numeric not null,
    carbs numeric not null,
    protein numeric not null,
    created_at timestamptz not null default now()
);