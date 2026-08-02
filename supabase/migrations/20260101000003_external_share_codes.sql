-- Create table for external access codes (Adult version of kid login codes)
create table if not exists public.external_access_codes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    label text not null,
    access_code text not null,
    password_hash text not null,
    password_salt text not null,
    permissions jsonb not null default '{"totals": true, "charts": true, "categories": true, "transactions": false}'::jsonb,
    expires_at timestamptz not null,
    created_at timestamptz default now() not null,
    last_used_at timestamptz,
    revoked_at timestamptz,
    unique(access_code)
);

-- Access logs for external codes
create table if not exists public.external_access_logs (
    id uuid primary key default gen_random_uuid(),
    code_id uuid references public.external_access_codes(id) on delete cascade not null,
    action text not null, -- 'login', 'failed_attempt', 'view'
    ip_address text,
    user_agent text,
    created_at timestamptz default now() not null
);

-- RLS
alter table public.external_access_codes enable row level security;
alter table public.external_access_logs enable row level security;

grant select, insert, update, delete on public.external_access_codes to authenticated;
grant all on public.external_access_codes to service_role;

grant select, insert on public.external_access_logs to authenticated;
grant all on public.external_access_logs to service_role;

-- Policies
create policy "Users can manage their own external codes"
    on public.external_access_codes
    for all
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can view logs of their codes"
    on public.external_access_logs
    for select
    to authenticated
    using (exists (
        select 1 from public.external_access_codes
        where id = external_access_logs.code_id
        and user_id = auth.uid()
    ));

-- Function to check code access securely
create or replace function public.verify_external_access(p_code text)
returns table (
    id uuid,
    user_id uuid,
    permissions jsonb,
    password_hash text,
    password_salt text
)
language sql
security definer
set search_path = public
as $$
    select id, user_id, permissions, password_hash, password_salt
    from external_access_codes
    where access_code = p_code
      and revoked_at is null
      and expires_at > now();
$$;
