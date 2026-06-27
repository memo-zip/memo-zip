import { CongestionLevel, CongestionResult, Flight } from '@/types';

const THRESHOLDS = {
  green:  { max: 300,  label: '필요 없음',  emoji: '🟢', waitMin: 0,  waitMax: 15 },
  yellow: { max: 600,  label: '애매함',     emoji: '🟡', waitMin: 15, waitMax: 30 },
  orange: { max: 900,  label: '추천',       emoji: '🟠', waitMin: 40, waitMax: 60 },
  red:    { max: Infinity, label: '강력 추천', emoji: '🔴', waitMin: 60, waitMax: 90 },
};

function isNightFlight(arrivalTime: string): boolean {
  const hour = new Date(arrivalTime).getHours();
  return hour >= 22 || hour < 6;
}

function getLevel(pax: number): CongestionLevel {
  if (pax <= 300) return 'green';
  if (pax <= 600) return 'yellow';
  if (pax <= 900) return 'orange';
  return 'red';
}

export function calculateCongestion(
  selectedFlight: Flight,
  allFlights: Flight[],
  airportMultiplier = 1.0,
  hasChildren = false,
): CongestionResult {
  const arrivalTime = new Date(selectedFlight.scheduled_arrival);
  const windowStart = new Date(arrivalTime.getTime() - 60 * 60 * 1000);

  const concurrentFlights = allFlights.filter((f) => {
    const t = new Date(f.scheduled_arrival);
    return t >= windowStart && t <= arrivalTime;
  });

  const rawPax = concurrentFlights.reduce((sum, f) => sum + (f.seat_capacity ?? 0), 0);

  let multiplier = airportMultiplier;
  if (isNightFlight(selectedFlight.scheduled_arrival)) multiplier *= 1.2;
  if (hasChildren) multiplier *= 1.1;

  const totalPax = Math.round(rawPax * multiplier);
  const level = getLevel(totalPax);
  const threshold = THRESHOLDS[level];

  return {
    level,
    label: threshold.label,
    emoji: threshold.emoji,
    totalPax,
    windowStart: windowStart.toISOString(),
    windowEnd: arrivalTime.toISOString(),
    concurrentFlights,
    selectedFlight,
    estimatedWaitMin: threshold.waitMin,
    estimatedWaitMax: threshold.waitMax,
    isNightFlight: isNightFlight(selectedFlight.scheduled_arrival),
  };
}
