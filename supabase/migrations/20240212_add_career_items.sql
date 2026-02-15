-- Create career_items table for tracking roles, certifications, and skills
create table if not exists career_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('role', 'certification', 'skill')) not null,
  title text not null,
  description text,
  url text,
  status text default 'saved', -- 'saved', 'in_progress', 'completed'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table career_items enable row level security;

create policy "Users can view their own career items"
  on career_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own career items"
  on career_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own career items"
  on career_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own career items"
  on career_items for delete
  using (auth.uid() = user_id);

-- Add indexes
create index if not exists idx_career_items_user_id on career_items(user_id);
create index if not exists idx_career_items_type on career_items(type);
