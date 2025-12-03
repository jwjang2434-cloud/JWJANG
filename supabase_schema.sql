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

-- RLS(Row Level Security) 정책 설정 (선택사항: 일단 모든 접근 허용)
alter table portal_users enable row level security;

create policy "Enable read access for all users"
on portal_users for select
using (true);

create policy "Enable insert access for all users"
on portal_users for insert
with check (true);

create policy "Enable update access for all users"
on portal_users for update
using (true);

create policy "Enable delete access for all users"
on portal_users for delete
using (true);
