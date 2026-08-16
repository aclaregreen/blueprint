-- Local dev user: email test@example.com / password password123
with
  new_user as (
    insert into
      auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      )
    values
      (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'andrew.claregreen@gmail.com',
        crypt ('111111', gen_salt ('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
    returning
      id,
      email
  )
insert into
  auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
select
  gen_random_uuid(),
  new_user.id,
  new_user.id::text,
  format(
    '{"sub":"%s","email":"%s"}',
    new_user.id,
    new_user.email
  )::jsonb,
  'email',
  now(),
  now(),
  now()
from
  new_user;
