create table if not exists public.kid_goals (
    id uuid primary key default gen_random_uuid(),
    dependent_id uuid references public.dependents(id) on delete cascade not null,
    title text not null,
    target_amount numeric(12,2) not null,
    period text not null check (period in ('monthly', 'yearly')),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    deleted_at timestamptz
);

grant all on public.kid_goals to authenticated;
grant all on public.kid_goals to service_role;

alter table public.kid_goals enable row level security;

create policy "Users can manage goals of their dependents"
on public.kid_goals
for all
to authenticated
using (
    exists (
        select 1 from public.dependents d
        where d.id = kid_goals.dependent_id
        and d.user_id = auth.uid()
    )
);

create policy "Kids can read their own goals"
on public.kid_goals
for select
to authenticated
using (
    exists (
        select 1 from public.dependents d
        where d.id = kid_goals.dependent_id
        and d.kid_user_id = auth.uid()
    )
);