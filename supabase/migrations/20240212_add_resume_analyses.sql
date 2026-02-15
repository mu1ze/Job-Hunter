-- Create resume_analyses table for storing AI analysis history
create table if not exists resume_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resume_id uuid references resumes(id) on delete cascade not null,
  analysis_data jsonb not null,
  created_at timestamptz default now()
);

-- Add RLS policies
alter table resume_analyses enable row level security;

create policy "Users can view their own analyses"
  on resume_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on resume_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on resume_analyses for delete
  using (auth.uid() = user_id);

-- Add indexes
create index if not exists idx_resume_analyses_user_id on resume_analyses(user_id);
create index if not exists idx_resume_analyses_resume_id on resume_analyses(resume_id);
