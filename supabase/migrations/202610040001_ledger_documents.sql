-- Run once in the project's SQL editor. No service-role key is used by MyTax.
begin;
create table public.ledger_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check ((document->>'schemaVersion' = '1' and jsonb_typeof(document->'transactions') = 'array' and jsonb_typeof(document->'settings') = 'object' and octet_length(document::text) <= 3500000) is true),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.ledger_documents enable row level security;
revoke all on public.ledger_documents from anon;
grant select, insert, update, delete on public.ledger_documents to authenticated;
create policy "own ledger only" on public.ledger_documents for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.advance_ledger_revision() returns trigger language plpgsql
  set search_path = '' as $$
begin
  if tg_op = 'INSERT' then new.revision := 1;
  else new.revision := old.revision + 1; new.user_id := old.user_id;
  end if;
  new.updated_at := now(); return new;
end; $$;
create trigger ledger_revision before insert or update on public.ledger_documents
  for each row execute function public.advance_ledger_revision();
commit;
