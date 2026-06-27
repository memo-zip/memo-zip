// AviationStack API - 무료 100회/월
// https://aviationstack.com/documentation

const BASE_URL = 'http://api.aviationstack.com/v1';

interface AviationStackFlight {
  flight_date: string;
  flight_status: string;
  arrival: {
    airport: string;
    iata: string;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  departure: {
    airport: string;
    iata: string;
    scheduled: string;
  };
  flight: {
    number: string;
    iata: string;
  };
  airline: {
    name: string;
    iata: string;
  };
  aircraft: {
    iata: string | null;
  } | null;
}

// 기종별 좌석 수 (직접 관리)
const AIRCRAFT_SEATS: Record<string, number> = {
  B738: 189, B737: 149, B739: 215,
  A320: 180, A321: 220, A319: 144,
  A332: 250, A333: 277, A359: 311,
  B77W: 396, B772: 375, B788: 296, B789: 296,
  AT72: 72,  AT76: 78,
  DEFAULT: 180,
};

export function getSeatCapacity(aircraftIata: string | null | undefined): number {
  if (!aircraftIata) return AIRCRAFT_SEATS.DEFAULT;
  return AIRCRAFT_SEATS[aircraftIata] ?? AIRCRAFT_SEATS.DEFAULT;
}

export async function fetchArrivals(airportIata: string, date: string) {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) throw new Error('AVIATIONSTACK_API_KEY not set');

  const params = new URLSearchParams({
    access_key: apiKey,
    arr_iata: airportIata,
    flight_date: date,
    flight_status: 'scheduled',
    limit: '100',
  });

  const res = await fetch(`${BASE_URL}/flights?${params}`);
  if (!res.ok) throw new Error(`AviationStack error: ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(json.error.message);

  const flights: AviationStackFlight[] = json.data ?? [];

  return flights.map((f) => ({
    airport_iata: airportIata,
    flight_number: f.flight.iata,
    airline_iata: f.airline.iata,
    airline_name: f.airline.name,
    scheduled_arrival: f.arrival.scheduled,
    aircraft_type: f.aircraft?.iata ?? null,
    seat_capacity: getSeatCapacity(f.aircraft?.iata),
    flight_date: date,
  }));
}
