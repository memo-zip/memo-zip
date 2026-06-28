// Vercel Cron: 매일 UTC 15:00 (베트남 자정 +7) 실행
// AeroDataBox로 14일 후 다낭 도착편 수집 + 파라타항공 자동 추가
import { NextResponse } from 'next/server';
import { fetchArrivals } from '@/lib/aerodatabox';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 300;

function getDateStr(offsetDays: number) {
  const d = new Date();
  d.setHours(d.getHours() + 7); // 베트남 UTC+7
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// 수=3, 목=4, 토=6, 일=0 (베트남 로컬 기준)
function isParataairDay(dateStr: string): boolean {
  const day = new Date(dateStr + 'T00:00:00+07:00').getDay();
  return [0, 3, 4, 6].includes(day);
}

function buildParataairFlight(dateStr: string) {
  return {
    airport_iata: 'DAD',
    flight_number: 'WE201',
    airline_iata: 'WE',
    airline_name: 'Parataair',
    scheduled_arrival: `${dateStr}T21:10:00+07:00`,
    aircraft_type: 'A332',
    seat_capacity: 250,
    flight_date: dateStr,
    departure_city: 'Incheon',
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  const dates = dateParam
    ? [dateParam]
    : [getDateStr(14)];

  const results: Record<string, unknown> = {};

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    if (i > 0) await new Promise(r => setTimeout(r, 8000));
    try {
      const raw = await fetchArrivals('DAD', date);
      const seen = new Set<string>();
      const flights = raw.filter(f => {
        const key = `${f.flight_number}|${f.flight_date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // 파라타항공 운항일이면 자동 추가 (AeroDataBox에 없는 항공사)
      if (isParataairDay(date) && !flights.find(f => f.flight_number === 'WE201')) {
        flights.push(buildParataairFlight(date));
      }

      const { error } = await supabaseAdmin
        .from('flights')
        .upsert(flights, { onConflict: 'airport_iata,flight_number,flight_date' });

      results[date] = error ? { error: error.message } : { count: flights.length };
    } catch (e) {
      results[date] = { error: e instanceof Error ? e.message : 'unknown' };
    }
  }

  return NextResponse.json({ results });
}
