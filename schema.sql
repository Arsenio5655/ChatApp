-- ============================================================
-- SCHEMA: App de Mensagens
-- Rode este script no SQL Editor do seu projeto Supabase
-- (é seguro rodar mais de uma vez, todos os comandos são idempotentes)
-- ============================================================

-- 1) Tabela de perfis (1 perfil = 1 usuário autenticado)
-- nickname começa NULL: a conta é criada só com email/senha, o nickname
-- é escolhido depois, numa tela própria (SetNicknameScreen).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique,
  created_at timestamptz not null default now()
);

-- Se a tabela já existia com "nickname not null" de uma versão anterior,
-- este comando remove a restrição (não dá erro se já estiver nullable).
alter table public.profiles alter column nickname drop not null;

-- nickname, quando definido, precisa ser minúsculo, sem @, 3 a 20
-- caracteres, só letras/números/underscore. NULL é sempre permitido
-- (checks em Postgres passam quando o valor é NULL).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'nickname_format'
  ) then
    alter table public.profiles
      add constraint nickname_format
      check (nickname ~ '^[a-z0-9_]{3,20}$');
  end if;
end $$;

-- 2) Tabela de mensagens (chat 1-para-1)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (least(sender_id, receiver_id), greatest(sender_id, receiver_id), created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles são visíveis para autenticados" on public.profiles;
create policy "profiles são visíveis para autenticados"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "usuário cria o próprio perfil" on public.profiles;
create policy "usuário cria o próprio perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Precisa existir: é essa policy que permite o usuário DEFINIR o próprio
-- nickname depois de logado (update feito pela SetNicknameScreen).
drop policy if exists "usuário edita o próprio perfil" on public.profiles;
create policy "usuário edita o próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "usuário vê suas próprias conversas" on public.messages;
create policy "usuário vê suas próprias conversas"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "usuário envia mensagem como remetente" on public.messages;
create policy "usuário envia mensagem como remetente"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- ============================================================
-- CRIAÇÃO AUTOMÁTICA DO PERFIL (evita erro de FK/RLS)
-- ============================================================
-- O trigger cria a linha em profiles assim que o usuário é criado em
-- auth.users, só com o id (nickname fica NULL). O nickname é preenchido
-- depois, via update, quando o usuário escolhe na SetNicknameScreen.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REALTIME (para o chat atualizar em tempo real)
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;