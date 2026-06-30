// AeroDataBox API via RapidAPI
// https://rapidapi.com/aedbx-aedbx/api/aerodatabox

interface AeroFlight {
  number: string;
  airline: { name: string; iata: string } | null;
  aircraft: { model: string; reg?: string } | null;
  arrival: {
    scheduledTime?: { utc?: string; local?: string };
  } | null;
  departure: {
    airport?: { countryCode?: string; name?: string };
  } | null;
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

function modelToType(model: string | null | undefined): string | null {
  if (!model) return null;
  const m = model.toUpperCase();
  if (m.includes('737-800') || m.includes('738')) return 'B738';
  if (m.includes('737-900') || m.includes('739')) return 'B739';
  if (m.includes('737')) return 'B737';
  if (m.includes('321')) return 'A321';
  if (m.includes('320')) return 'A320';
  if (m.includes('319')) return 'A319';
  if (m.includes('332') || m.includes('330-200')) return 'A332';
  if (m.includes('333') || m.includes('330-300')) return 'A333';
  return null;
}

function getSeatCapacity(model: string | null | undefined): number {
  const type = modelToType(model);
  if (!type) return AIRCRAFT_SEATS.DEFAULT;
  return AIRCRAFT_SEATS[type] ?? AIRCRAFT_SEATS.DEFAULT;
}

export async function fetchArrivals(airportIata: string, date: string) {
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) throw new Error('AERODATABOX_API_KEY not set');

  const headers = {
    'X-RapidAPI-Key':  apiKey,
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
  };
  const params = 'withLeg=true&direction=Arrival&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false';
  // DAD(IATA) → VVDN(ICAO) 변환
  const icaoMap: Record<string, string> = { DAD: 'VVDN', CXR: 'VVCR' };
  const icao = icaoMap[airportIata] ?? airportIata;
  const base = `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${icao}`;

  // AeroDataBox 최대 12시간 범위 → 오전/오후로 나눠 순차 호출
  const res1 = await fetch(`${base}/${date}T00:00/${date}T11:59?${params}`, { headers });
  if (!res1.ok) throw new Error(`AeroDataBox error: ${res1.status}`);
  const json1: AeroResponse = await res1.json();

  await new Promise(r => setTimeout(r, 1500));

  const res2 = await fetch(`${base}/${date}T12:00/${date}T23:59?${params}`, { headers });
  if (!res2.ok) throw new Error(`AeroDataBox error: ${res2.status}`);
  const json2: AeroResponse = await res2.json();

  const arrivals = [...(json1.arrivals ?? []), ...(json2.arrivals ?? [])];

  return arrivals.map(f => {
    const flightNumber = f.number.replace(/\s+/g, '');
    const scheduledArrival = f.arrival?.scheduledTime?.local ?? '';
    const departureCountry = f.departure?.airport?.countryCode;
    const departureCity = f.departure?.airport?.name ?? null;
    return {
      airport_iata: airportIata,
      flight_number: flightNumber,
      airline_iata: f.airline?.iata ?? flightNumber.slice(0, 2),
      airline_name: f.airline?.name ?? '',
      scheduled_arrival: scheduledArrival,
      aircraft_type: modelToType(f.aircraft?.model),
      seat_capacity: getSeatCapacity(f.aircraft?.model),
      flight_date: date,
      departure_city: departureCity,
      _departureCountry: departureCountry,
    };
  }).filter(f => f.scheduled_arrival && f._departureCountry !== 'vn' && f.departure_city !== null)
    .map(({ _departureCountry: _, ...f }) => f);
}
