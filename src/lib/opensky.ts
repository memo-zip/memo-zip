// OpenSky Network API - 무료, 인증 불필요
// https://openskynetwork.github.io/opensky-api/rest.html
// 다낭 ICAO: VVDN

const BASE_URL = 'https://opensky-network.org/api';

// 다낭 도착 한국 항공사 편명 → 항공사명 매핑
const AIRLINE_MAP: Record<string, { name: string; iata: string }> = {
  KE: { name: '대한항공',    iata: 'KE' },
  OZ: { name: '아시아나항공', iata: 'OZ' },
  LJ: { name: '진에어',      iata: 'LJ' },
  BX: { name: '에어부산',    iata: 'BX' },
  RS: { name: '에어서울',    iata: 'RS' },
  ZE: { name: '이스타항공',  iata: 'ZE' },
  TW: { name: '티웨이항공',  iata: 'TW' },
  '7C': { name: '제주항공',  iata: '7C' },
  VJ: { name: 'VietJet Air', iata: 'VJ' },
  VN: { name: '베트남항공',  iata: 'VN' },
  QH: { name: '뱀부항공',    iata: 'QH' },
};

const AIRCRAFT_SEATS: Record<string, number> = {
  B738: 189, B737: 149, B739: 215,
  A320: 180, A321: 220, A319: 144,
  A332: 250, A333: 277,
  DEFAULT: 180,
};

export function getSeatCapacity(type: string | null | undefined): number {
  if (!type) return AIRCRAFT_SEATS.DEFAULT;
  return AIRCRAFT_SEATS[type] ?? AIRCRAFT_SEATS.DEFAULT;
}

interface OpenSkyFlight {
  icao24: string;
  firstSeen: number;
  estDepartureAirport: string | null;
  lastSeen: number;
  estArrivalAirport: string | null;
  callsign: string | null;
}

function callsignToIata(callsign: string): { flightIata: string; airlineIata: string } | null {
  if (!callsign) return null;
  const cs = callsign.trim();
  // ICAO callsign → IATA: 3글자 airline code + number
  // e.g. KAL469 → KE469, AAR737 → OZ737, JNA139 → LJ139
  const ICAO_TO_IATA: Record<string, string> = {
    KAL: 'KE', AAR: 'OZ', JNA: 'LJ', ABL: 'BX', ASV: 'RS',
    ESR: 'ZE', TWB: 'TW', JJA: '7C', VJC: 'VJ', HVN: 'VN', QH: 'QH',
  };
  for (const [icao, iata] of Object.entries(ICAO_TO_IATA)) {
    if (cs.startsWith(icao)) {
      const num = cs.slice(icao.length).trim();
      return { flightIata: `${iata}${num}`, airlineIata: iata };
    }
  }
  // 2글자로 시작하면 바로 IATA
  const twoChar = cs.slice(0, 2);
  if (AIRLINE_MAP[twoChar]) {
    return { flightIata: cs, airlineIata: twoChar };
  }
  return null;
}

export async function fetchArrivals(airportIcao: string, date: string) {
  // date = 'YYYY-MM-DD' (UTC 기준)
  const dayStart = Math.floor(new Date(`${date}T00:00:00+07:00`).getTime() / 1000);
  const dayEnd   = Math.floor(new Date(`${date}T23:59:59+07:00`).getTime() / 1000);

  const url = `${BASE_URL}/flights/arrival?airport=${airportIcao}&begin=${dayStart}&end=${dayEnd}`;
  const res = await fetch(url);

  if (res.status === 404) return []; // 데이터 없음
  if (!res.ok) throw new Error(`OpenSky error: ${res.status}`);

  const flights: OpenSkyFlight[] = await res.json();

  return flights
    .filter(f => f.callsign && f.lastSeen)
    .map(f => {
      const parsed = callsignToIata(f.callsign!);
      if (!parsed) return null;
      const airline = AIRLINE_MAP[parsed.airlineIata];
      const arrivalTime = new Date(f.lastSeen * 1000).toISOString();
      return {
        airport_iata: 'DAD',
        flight_number: parsed.flightIata,
        airline_iata: parsed.airlineIata,
        airline_name: airline?.name ?? parsed.airlineIata,
        scheduled_arrival: arrivalTime,
        aircraft_type: null,
        seat_capacity: AIRCRAFT_SEATS.DEFAULT,
        flight_date: date,
      };
    })
    .filter(Boolean);
}
