-- Create todos table
create table public.todos (
  id bigint primary key generated always as identity,
  task text not null,
  is_complete boolean default false,
  user_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create countries table
create table public.countries (
  id bigint primary key generated always as identity,
  code text not null,
  name text not null,
  continent text,
  created_at timestamptz default now()
);

-- Create messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  room text not null,
  username text not null,
  created_at timestamptz default now()
);

-- Insert sample data for testing
insert into public.countries (code, name, continent) values
  ('US', 'United States', 'North America'),
  ('UK', 'United Kingdom', 'Europe'),
  ('JP', 'Japan', 'Asia');

insert into public.messages (content, room, username) values
  ('Hello world!', 'general', 'alice'),
  ('Test message', 'general', 'bob');
