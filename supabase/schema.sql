-- SmartLearn schema for Supabase (Postgres). Run it in the Supabase SQL Editor.
-- The Express server uses the service_role key, which bypasses RLS.
-- RLS protects the data if someone uses the public anon key directly.
create extension if not exists vector;

-- 1. PROFILES (one row per auth user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Student',
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Student'));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. LEARNING CONTENT
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  content text not null default '',
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null,
  type text not null default 'link' check (type in ('video','article','pdf','link')),
  url text not null
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_index smallint not null,
  explanation text
);

-- 3. STUDENT ACTIVITY
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  score numeric(5,2) not null,
  total_questions int not null,
  correct_answers int not null,
  taken_at timestamptz not null default now()
);

create table public.topic_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  mastery_score numeric(5,2) not null default 0,
  last_attempt_at timestamptz,
  primary key (user_id, topic_id)
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 4. ANIME EXPLAINER
create table public.explainers (
  topic_id uuid primary key references public.topics(id) on delete cascade,
  storyboard jsonb not null,
  source text not null default 'llm' check (source in ('llm','fallback')),
  created_at timestamptz not null default now()
);

create table public.explainer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  helped boolean not null,
  check_score numeric(5,2),
  created_at timestamptz not null default now()
);

-- 5. RAG AND TUTOR (768 = embedding size, keep it in sync with the server)
create table public.content_chunks (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  chunk text not null,
  embedding vector(768),
  fts tsvector generated always as (to_tsvector('english', chunk)) stored
);

create table public.tutor_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null default current_date,
  message_count int not null default 0,
  primary key (user_id, day)
);

create or replace function public.match_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_topic uuid default null
)
returns table (id uuid, topic_id uuid, chunk text, similarity float)
language sql stable as $$
  select c.id, c.topic_id, c.chunk, 1 - (c.embedding <=> query_embedding) as similarity
  from public.content_chunks c
  where c.embedding is not null and (filter_topic is null or c.topic_id = filter_topic)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.search_chunks_text(
  query_text text,
  match_count int default 5,
  filter_topic uuid default null
)
returns table (id uuid, topic_id uuid, chunk text, rank real)
language sql stable as $$
  select c.id, c.topic_id, c.chunk, ts_rank(c.fts, websearch_to_tsquery('english', query_text)) as rank
  from public.content_chunks c
  where c.fts @@ websearch_to_tsquery('english', query_text)
    and (filter_topic is null or c.topic_id = filter_topic)
  order by rank desc
  limit match_count;
$$;

-- 6. INDEXES
create index on public.topics (subject_id);
create index on public.resources (topic_id);
create index on public.questions (topic_id);
create index on public.attempts (user_id, topic_id);
create index on public.recommendations (user_id);
create index on public.content_chunks using hnsw (embedding vector_cosine_ops);
create index on public.content_chunks using gin (fts);

-- 7. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.resources enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.topic_progress enable row level security;
alter table public.recommendations enable row level security;
alter table public.explainers enable row level security;
alter table public.explainer_feedback enable row level security;
alter table public.content_chunks enable row level security;
alter table public.tutor_usage enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "read own profile" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "read subjects" on public.subjects for select to authenticated
  using (true);
create policy "admin manages subjects" on public.subjects for all
  using (public.is_admin()) with check (public.is_admin());

create policy "read topics" on public.topics for select to authenticated
  using (true);
create policy "admin manages topics" on public.topics for all
  using (public.is_admin()) with check (public.is_admin());

create policy "read resources" on public.resources for select to authenticated
  using (true);
create policy "admin manages resources" on public.resources for all
  using (public.is_admin()) with check (public.is_admin());

-- questions hold the correct answers, so only admins can read them directly
create policy "admin manages questions" on public.questions for all
  using (public.is_admin()) with check (public.is_admin());

create policy "read own attempts" on public.attempts for select
  using (user_id = auth.uid());
create policy "read own progress" on public.topic_progress for select
  using (user_id = auth.uid());
create policy "read own recommendations" on public.recommendations for select
  using (user_id = auth.uid());

create policy "read explainers" on public.explainers for select to authenticated
  using (true);

create policy "read own feedback" on public.explainer_feedback for select
  using (user_id = auth.uid());
create policy "insert own feedback" on public.explainer_feedback for insert
  with check (user_id = auth.uid());

-- content_chunks and tutor_usage have no policies on purpose: only the server can use them.

-- 8. MAKE YOURSELF ADMIN (register in the app first, then run this with your email)
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
