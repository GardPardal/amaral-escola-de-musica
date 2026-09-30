-- Amaral Escola de Música — banco da área do aluno (Supabase / Postgres)
-- Rode uma vez no SQL Editor do projeto Supabase.

-- "Hoje" no horário de Brasília (marcação de estudo do dia)
alter database postgres set timezone to 'America/Sao_Paulo';

-- Perfis --------------------------------------------------------------------
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  instrumento text not null default 'Teclado',
  papel text not null default 'aluno' check (papel in ('aluno', 'professor')),
  aprovado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- Cria o perfil quando alguém se cadastra (nome e instrumento vêm do formulário)
create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, instrumento)
  values (
    new.id,
    coalesce(left(new.raw_user_meta_data ->> 'nome', 80), ''),
    coalesce(left(new.raw_user_meta_data ->> 'instrumento', 40), 'Teclado')
  );
  return new;
end $$;
drop trigger if exists ao_cadastrar on auth.users;
create trigger ao_cadastrar after insert on auth.users
  for each row execute function public.novo_usuario();

create or replace function public.eh_professor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'professor');
$$;
create or replace function public.eh_aprovado() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and aprovado);
$$;

-- Aluno não pode se promover nem se aprovar.
-- (Sem usuário logado = SQL Editor do painel: o dono do projeto pode tudo.)
create or replace function public.proteger_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.eh_professor() then
    new.papel := old.papel;
    new.aprovado := old.aprovado;
  end if;
  new.id := old.id;
  return new;
end $$;
drop trigger if exists proteger_perfil on public.perfis;
create trigger proteger_perfil before update on public.perfis
  for each row execute function public.proteger_perfil();

-- Rotinas de estudo (só o professor publica) ---------------------------------
create table if not exists public.rotinas (
  id bigint generated always as identity primary key,
  titulo text not null check (length(titulo) between 1 and 120),
  instrumento text not null default 'Todos',
  nivel text not null default 'Todos os níveis',
  itens jsonb not null default '[]'::jsonb,   -- [{ "texto": "...", "minutos": 10 }]
  observacao text not null default '',
  ativa boolean not null default true,
  autor_id uuid not null default auth.uid() references public.perfis (id),
  criado_em timestamptz not null default now()
);

-- Progresso: um registro por item estudado por dia --------------------------
create table if not exists public.progresso (
  aluno_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  rotina_id bigint not null references public.rotinas (id) on delete cascade,
  item int not null,
  minutos int not null default 0 check (minutos between 0 and 600),
  dia date not null default current_date,
  primary key (aluno_id, rotina_id, item, dia)
);

-- Comunidade ----------------------------------------------------------------
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  texto text not null check (length(texto) between 1 and 2000),
  link text not null default '' check (link = '' or link ~* '^https://'),
  criado_em timestamptz not null default now()
);
create table if not exists public.comentarios (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  texto text not null check (length(texto) between 1 and 1000),
  criado_em timestamptz not null default now()
);
create table if not exists public.curtidas (
  post_id bigint not null references public.posts (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  primary key (post_id, autor_id)
);

-- Segurança (RLS) -----------------------------------------------------------
alter table public.perfis enable row level security;
alter table public.rotinas enable row level security;
alter table public.progresso enable row level security;
alter table public.posts enable row level security;
alter table public.comentarios enable row level security;
alter table public.curtidas enable row level security;

drop policy if exists perfis_ler on public.perfis;
create policy perfis_ler on public.perfis for select
  using (id = auth.uid() or public.eh_aprovado());
drop policy if exists perfis_editar on public.perfis;
create policy perfis_editar on public.perfis for update
  using (id = auth.uid() or public.eh_professor());

drop policy if exists rotinas_ler on public.rotinas;
create policy rotinas_ler on public.rotinas for select using (public.eh_aprovado());
drop policy if exists rotinas_professor on public.rotinas;
create policy rotinas_professor on public.rotinas for all
  using (public.eh_professor()) with check (public.eh_professor());

drop policy if exists progresso_ler on public.progresso;
create policy progresso_ler on public.progresso for select
  using (aluno_id = auth.uid() or public.eh_professor());
drop policy if exists progresso_marcar on public.progresso;
create policy progresso_marcar on public.progresso for insert
  with check (aluno_id = auth.uid() and public.eh_aprovado() and dia = current_date);
drop policy if exists progresso_desmarcar on public.progresso;
create policy progresso_desmarcar on public.progresso for delete
  using (aluno_id = auth.uid());

drop policy if exists posts_ler on public.posts;
create policy posts_ler on public.posts for select using (public.eh_aprovado());
drop policy if exists posts_criar on public.posts;
create policy posts_criar on public.posts for insert
  with check (autor_id = auth.uid() and public.eh_aprovado());
drop policy if exists posts_apagar on public.posts;
create policy posts_apagar on public.posts for delete
  using (autor_id = auth.uid() or public.eh_professor());

drop policy if exists comentarios_ler on public.comentarios;
create policy comentarios_ler on public.comentarios for select using (public.eh_aprovado());
drop policy if exists comentarios_criar on public.comentarios;
create policy comentarios_criar on public.comentarios for insert
  with check (autor_id = auth.uid() and public.eh_aprovado());
drop policy if exists comentarios_apagar on public.comentarios;
create policy comentarios_apagar on public.comentarios for delete
  using (autor_id = auth.uid() or public.eh_professor());

drop policy if exists curtidas_ler on public.curtidas;
create policy curtidas_ler on public.curtidas for select using (public.eh_aprovado());
drop policy if exists curtidas_dar on public.curtidas;
create policy curtidas_dar on public.curtidas for insert
  with check (autor_id = auth.uid() and public.eh_aprovado());
drop policy if exists curtidas_tirar on public.curtidas;
create policy curtidas_tirar on public.curtidas for delete using (autor_id = auth.uid());

-- Depois de se cadastrar no app, torne-se professor (troque o e-mail):
-- update public.perfis set papel = 'professor', aprovado = true
--   where id = (select id from auth.users where email = 'SEU-EMAIL@exemplo.com');
