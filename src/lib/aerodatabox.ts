// AeroDataBox API via RapidAPI
// https://rapidapi.com/aedbx-aedbx/api/aerodatabox

interface AeroFlight {
  number: string;
  airline: { name: string; iata: string } | null;
  aircraft: { model: string; reg: string } | null;
  scheduledTimeLocal: { departure?: string; arrival?: string } | null;
  status: string;
}

interface AeroResponse {
  arrivals: AeroFlight[];
}

const AIRCRAFT_SEATS: Record<string, number> = {
  B738: 189, B737: 149, B739: 215,
  A320: 180, A321: 220, A319: 144,
  A332: 250, A333: 277,
  DEFAULT: 180,
};

function getSeatCapacity(model: string | null | undefined): number {
  if (!model) return AIRCRAFT_SEATS.DEFAULT;
  const key = model.replace('-', '').toUpperCase().slice(0, 4);
  return AIRCRAFT_SEATS[key] ?? AIRCRAFT_SEATS.DEFAULT;
}

export async function fetchArrivals(airportIata: string, date: string) {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) throw new Error('AERODATABOX_API_KEY not set');

  const headers = {
    'X-RapidAPI-Key':  apiKey,
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
  };
  const params = 'withLeg=true&direction=Arrival&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false';
  const base = `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airportIata}`;

  // AeroDataBox 최대 12시간 범위 → 오전/오후로 나눠 2번 호출
  const [res1, res2] = await Promise.all([
    fetch(`${base}/${date}T00:00/${date}T11:59?${params}`, { headers }),
    fetch(`${base}/${date}T12:00/${date}T23:59?${params}`, { headers }),
  ]);

  if (!res1.ok) throw new Error(`AeroDataBox error: ${res1.status}`);
  if (!res2.ok) throw new Error(`AeroDataBox error: ${res2.status}`);

  const [json1, json2]: [AeroResponse, AeroResponse] = await Promise.all([res1.json(), res2.json()]);
  const arrivals = [...(json1.arrivals ?? []), ...(json2.arrivals ?? [])];

  return arrivals.map(f => ({
    airport_iata: airportIata,
    flight_number: f.number,
    airline_iata: f.airline?.iata ?? f.number.slice(0, 2),
    airline_name: f.airline?.name ?? '',
    scheduled_arrival: f.scheduledTimeLocal?.arrival ?? '',
    aircraft_type: f.aircraft?.model?.slice(0, 4).toUpperCase() ?? null,
    seat_capacity: getSeatCapacity(f.aircraft?.model),
    flight_date: date,
  })).filter(f => f.scheduled_arrival);
}
