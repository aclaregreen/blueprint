create table meal (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    name text not null,
    created_at timestamptz not null default now()
);