import { CongestionLevel, CongestionResult, FlightCongestion, Flight } from '@/types';

export const THRESHOLDS: Record<CongestionLevel, {
  label: string; waitMin: number; waitMax: number; color: string; bgColor: string;
}> = {
  green:  { label: '혼잡 없음',  waitMin: 0,  waitMax: 20, color: 'text-green-600',  bgColor: 'bg-green-500'  },
  yellow: { label: '애매함',     waitMin: 20, waitMax: 40, color: 'text-yellow-500', bgColor: 'bg-yellow-400' },
  orange: { label: '추천',       waitMin: 40, waitMax: 60, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  red:    { label: '강력 추천',  waitMin: 60, waitMax: 90, color: 'text-red-500',    bgColor: 'bg-red-500'    },
};

export function getLevel(pax: number): CongestionLevel {
  if (pax <= 300) return 'green';
  if (pax <= 600) return 'yellow';
  if (pax <= 900) return 'orange';
  return 'red';
}

// 혼잡도 점수 0~100 (863명 → 82점 기준)
export function calcScore(pax: number): number {
  return Math.min(100, Math.round(pax * 100 / 1050));
}

function isNightFlight(arrivalTime: string): boolean {
  const hour = new Date(arrivalTime).getHours();
  return hour >= 22 || hour < 6;
}

// 특정 항공편 기준 1시간 윈도우 혼잡도
function calcFlightCongestion(
  flight: Flight,
  allFlights: Flight[],
  multiplier: number,
  hasChildren: boolean,
): FlightCongestion {
  const arrivalTime = new Date(flight.scheduled_arrival);
  const windowStart = new Date(arrivalTime.getTime() - 60 * 60 * 1000);

  const concurrent = allFlights.filter((f) => {
    const t = new Date(f.scheduled_arrival);
    return t >= windowStart && t <= arrivalTime;
  });

  const rawPax = concurrent.reduce((sum, f) => sum + (f.seat_capacity ?? 0), 0);
  let m = multiplier;
  if (isNightFlight(flight.scheduled_arrival)) m *= 1.2;
  if (hasChildren) m *= 1.1;

  const totalPax = Math.round(rawPax * m);
  const level = getLevel(totalPax);
  const t = THRESHOLDS[level];

  return {
    flight,
    level,
    label: t.label,
    totalPax,
    waitMin: t.waitMin,
    waitMax: t.waitMax,
    windowStart: windowStart.toISOString(),
    windowEnd: arrivalTime.toISOString(),
    concurrentCount: concurrent.length,
  };
}

export function calculateCongestion(
  selectedFlight: Flight,
  allFlights: Flight[],
  airportMultiplier = 1.0,
  hasChildren = false,
): CongestionResult {
  const selected = calcFlightCongestion(selectedFlight, allFlights, airportMultiplier, hasChildren);

  // 전체 항공편 혼잡도 (테이블용)
  const flightRows = allFlights
    .map((f) => calcFlightCongestion(f, allFlights, airportMultiplier, hasChildren))
    .sort((a, b) =>
      new Date(a.flight.scheduled_arrival).getTime() - new Date(b.flight.scheduled_arrival).getTime()
    );

  // 선택 항공편 윈도우 내 편들 (총계 표시용)
  const windowStart = new Date(new Date(selectedFlight.scheduled_arrival).getTime() - 60 * 60 * 1000);
  const windowEnd = new Date(selectedFlight.scheduled_arrival);
  const concurrentFlights = allFlights.filter((f) => {
    const t = new Date(f.scheduled_arrival);
    return t >= windowStart && t <= windowEnd;
  });

  const score = calcScore(selected.totalPax);
  const childrenLevel = hasChildren ? selected.label : THRESHOLDS[getLevel(
    Math.round(concurrentFlights.reduce((s, f) => s + f.seat_capacity, 0) * airportMultiplier * (isNightFlight(selectedFlight.scheduled_arrival) ? 1.2 : 1))
  )].label;

  return {
    level: selected.level,
    label: selected.label,
    totalPax: selected.totalPax,
    windowStart: selected.windowStart,
    windowEnd: selected.windowEnd,
    concurrentFlights,
    selectedFlight,
    estimatedWaitMin: selected.waitMin,
    estimatedWaitMax: selected.waitMax,
    isNightFlight: isNightFlight(selectedFlight.scheduled_arrival),
    score,
    flightRows,
    hasChildren,
    childrenLevel,
  };
}
