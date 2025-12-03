-- Supabase SQL Editor에서 아래 코드를 실행해주세요.

create table if not exists portal_users (
  id text primary key,
  password text not null,
  name text not null,
  department text,
  role text default 'USER',
  company_name text,
  avatar_url text,
  birth_date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add team column if it doesn't exist (This is a schema update, so we use alter table)
-- Note: In a real migration, we'd check existence first. For this script, we assume it might be run on a fresh or existing DB.
-- alter table portal_users add column if not exists team text; 
-- (Supabase SQL Editor doesn't support 'if not exists' for columns in all versions easily without a function, 
--  but for this script we will just add the column definition to the create table above if it was fresh, 
--  or user can run: alter table portal_users add column team text; separately if table exists.)

-- For this file, I will append the new tables. 
-- User should run: alter table portal_users add column team text; manually if they already created the table.

create table if not exists schedules (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references portal_users(id) on delete cascade,
  title text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  type text not null check (type in ('PERSONAL', 'TEAM')),
  team_id text, -- Stores the team name for TEAM type events
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists calendar_permissions (
  id uuid default gen_random_uuid() primary key,
  grantee_id text not null references portal_users(id) on delete cascade, -- Who gets access
  target_team text not null, -- Which team they can see
  granted_by text not null references portal_users(id), -- Who granted it (Team Leader)
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(grantee_id, target_team) -- Prevent duplicate permissions
);

-- RLS Policies for Schedules
alter table schedules enable row level security;

-- Since we are using custom auth (not Supabase Auth), we cannot rely on auth.uid().
-- We will enable all access and rely on the application logic for security, similar to portal_users.

create policy "Enable all access for schedules"
on schedules for all
using (true)
with check (true);

-- RLS Policies for Permissions
alter table calendar_permissions enable row level security;

create policy "Enable all access for calendar_permissions"
on calendar_permissions for all
using (true)
with check (true);
