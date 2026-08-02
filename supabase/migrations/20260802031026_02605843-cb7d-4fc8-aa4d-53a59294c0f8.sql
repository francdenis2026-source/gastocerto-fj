create table public.energy_bills (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    bill_date date not null,
    amount decimal(12,2) not null,
    consumption_kwh decimal(12,2) not null,
    due_date date,
    paid_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone default now()
);

grant select, insert, update, delete on public.energy_bills to authenticated;
grant all on public.energy_bills to service_role;

alter table public.energy_bills enable row level security;

create policy "Users can manage their own energy bills"
on public.energy_bills
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
