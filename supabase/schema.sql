create table if not exists flights (
  id uuid primary key default gen_random_uuid(),
  airport_iata text not null,
  flight_number text not null,
  airline_iata text,
  airline_name text,
  scheduled_arrival timestamptz not null,
  aircraft_type text,
  seat_capacity int not null default 180,
  flight_date date not null,
  created_at timestamptz default now(),
  unique (airport_iata, flight_number, flight_date)
);

create index if not exists idx_flights_airport_date
  on flights (airport_iata, flight_date, scheduled_arrival);

alter table flights enable row level security;

create policy "Public read" on flights
  for select using (true);

create policy "Service write" on flights
  for all using (auth.role() = 'service_role');
