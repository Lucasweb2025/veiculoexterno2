-- L.A. Controle — schema Supabase (espelha Firebase RTDB)
-- Projeto: https://ccysxafhvgqrjlofvavp.supabase.co
-- Rode no SQL Editor do Supabase Dashboard.

-- ---------------------------------------------------------------------------
-- Perfis (papéis) — substitui /users/{uid}/role
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    role text not null check (role in ('motorista', 'gestor', 'admin')),
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Cadastros
-- ---------------------------------------------------------------------------
create table if not exists public.fleet (
    id text primary key,
    nome text not null,
    foto text,
    ativo boolean not null default true
);

create table if not exists public.motoristas (
    id text primary key,
    nome text not null,
    ativo boolean not null default true
);

create table if not exists public.unidades (
    id text primary key,
    nome text not null,
    nome_curto text,
    endereco text,
    lat double precision not null,
    lng double precision not null,
    matriz boolean not null default false,
    parada_rota boolean not null default false,
    ordem_rota integer
);

create table if not exists public.vehicles (
    id text primary key references public.fleet (id) on delete cascade,
    status text not null default 'DISPONÍVEL',
    odometer numeric not null default 0,
    last_pos jsonb
);

-- ---------------------------------------------------------------------------
-- Operacional
-- ---------------------------------------------------------------------------
create table if not exists public.trips (
    id uuid primary key default gen_random_uuid(),
    car text,
    driver text,
    km numeric,
    time text,
    date text,
    path jsonb,
    destino text,
    destino_id text,
    endereco_destino text,
    motivo_corrida text,
    problema_veiculo jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.vehicle_issues (
    id uuid primary key default gen_random_uuid(),
    vehicle_id text not null,
    vehicle_name text,
    driver text,
    tipos text[],
    descricao text,
    urgencia text,
    status text not null default 'aberto',
    date text,
    created_at timestamptz not null default now()
);

create table if not exists public.vehicle_maintenance (
    id uuid primary key default gen_random_uuid(),
    vehicle_id text not null,
    vehicle_name text,
    tipo text,
    descricao text,
    date text,
    km numeric,
    oficina text,
    custo numeric,
    driver text,
    role text,
    criado_em timestamptz not null default now(),
    registrado_por text,
    registrado_uid uuid
);

-- Realtime: no Dashboard → Database → Publications, habilite trips, vehicle_issues,
-- vehicle_maintenance e vehicles (ver docs/SUPABASE-MIGRACAO.md).

-- ---------------------------------------------------------------------------
-- Helpers RLS
-- ---------------------------------------------------------------------------
create or replace function public.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_gestor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(public.user_role(), '') in ('gestor', 'admin')
$$;

create or replace function public.is_motorista()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(public.user_role(), '') in ('motorista', 'admin')
$$;

-- ---------------------------------------------------------------------------
-- RPC: viagem final atômica
-- ---------------------------------------------------------------------------
create or replace function public.persistir_viagem_final(
    p_car_id text,
    p_km numeric,
    p_trip jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_trip_id uuid;
    v_odo numeric;
begin
    if not public.is_motorista() then
        raise exception 'Sem permissão';
    end if;

    select coalesce(odometer, 0) into v_odo
    from public.vehicles where id = p_car_id for update;

    if v_odo is null then
        insert into public.vehicles (id, status, odometer)
        values (p_car_id, 'DISPONÍVEL', 0)
        on conflict (id) do nothing;
        v_odo := 0;
    end if;

    insert into public.trips (
        car, driver, km, time, date, path,
        destino, destino_id, endereco_destino, motivo_corrida, problema_veiculo
    ) values (
        p_trip->>'car',
        p_trip->>'driver',
        p_km,
        p_trip->>'time',
        p_trip->>'date',
        p_trip->'path',
        p_trip->>'destino',
        p_trip->>'destinoId',
        p_trip->>'enderecoDestino',
        p_trip->>'motivoCorrida',
        p_trip->'problemaVeiculo'
    )
    returning id into v_trip_id;

    update public.vehicles
    set status = 'DISPONÍVEL', odometer = v_odo + p_km
    where id = p_car_id;

    return jsonb_build_object(
        'tripKey', v_trip_id::text,
        'trip', p_trip
    );
end;
$$;

grant execute on function public.persistir_viagem_final(text, numeric, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.fleet enable row level security;
alter table public.motoristas enable row level security;
alter table public.unidades enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.vehicle_issues enable row level security;
alter table public.vehicle_maintenance enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
    using (auth.uid() = id or public.is_gestor());
create policy profiles_write on public.profiles for all to authenticated
    using (public.is_gestor()) with check (public.is_gestor());

-- fleet / motoristas / unidades: leitura motorista+gestor; escrita gestor
create policy fleet_select on public.fleet for select to authenticated using (true);
create policy fleet_write on public.fleet for all to authenticated
    using (public.is_gestor()) with check (public.is_gestor());

create policy motoristas_select on public.motoristas for select to authenticated using (true);
create policy motoristas_write on public.motoristas for all to authenticated
    using (public.is_gestor()) with check (public.is_gestor());

create policy unidades_select on public.unidades for select to authenticated using (true);
create policy unidades_write on public.unidades for all to authenticated
    using (public.is_gestor()) with check (public.is_gestor());

-- vehicles
create policy vehicles_select on public.vehicles for select to authenticated using (true);
create policy vehicles_insert_motorista on public.vehicles for insert to authenticated
    with check (public.is_motorista());
create policy vehicles_update_motorista on public.vehicles for update to authenticated
    using (public.is_motorista()) with check (public.is_motorista());

-- trips: gestor lê; motorista insere
create policy trips_select on public.trips for select to authenticated
    using (public.is_gestor() or public.is_motorista());
create policy trips_insert on public.trips for insert to authenticated
    with check (public.is_motorista());

-- issues
create policy issues_select on public.vehicle_issues for select to authenticated using (true);
create policy issues_insert on public.vehicle_issues for insert to authenticated
    with check (public.is_motorista());
create policy issues_update_gestor on public.vehicle_issues for update to authenticated
    using (public.is_gestor()) with check (public.is_gestor());

-- maintenance
create policy maint_select on public.vehicle_maintenance for select to authenticated using (true);
create policy maint_insert on public.vehicle_maintenance for insert to authenticated
    with check (public.is_gestor() or public.is_motorista());
create policy maint_update on public.vehicle_maintenance for update to authenticated
    using (public.is_gestor()) with check (public.is_gestor());
