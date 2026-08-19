-- Diferencia o tipo de abastecimento e separa a distância desde o registro anterior
-- da distância de ciclo usada para calcular consumo tanque cheio -> tanque cheio.
alter table public.fuel_entries
  add column if not exists fill_mode text,
  add column if not exists distance_since_previous numeric;

update public.fuel_entries
set fill_mode = case when full_tank then 'full' else 'partial' end
where fill_mode is null;

alter table public.fuel_entries
  alter column fill_mode set default 'full',
  alter column fill_mode set not null;

alter table public.fuel_entries
  drop constraint if exists fuel_entries_fill_mode_check;

alter table public.fuel_entries
  add constraint fuel_entries_fill_mode_check
  check (fill_mode in ('full', 'top_off', 'partial'));

comment on column public.fuel_entries.fill_mode is
  'full=encheu o tanque; top_off=apenas completou ate encher; partial=abastecimento que nao deixou o tanque cheio';

comment on column public.fuel_entries.distance_since_previous is
  'Diferenca de odometro em km para o abastecimento imediatamente anterior do mesmo veiculo.';
