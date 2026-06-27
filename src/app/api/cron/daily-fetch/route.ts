// Vercel Cron: 매일 UTC 15:00 (베트남 자정 +7) 실행
// OpenSky Network로 당일 다낭 도착편 수집
import { NextResponse } from 'next/server';
import { fetchArrivals } from '@/lib/opensky';
import { supabase } from '@/lib/supabase';

export const maxDuration = 30;

const DAD_ICAO = 'VVDN';

export async function GET() {
  // 베트남 현재 날짜 (UTC+7)
  const now = new Date();
  now.setHours(now.getHours() + 7);
  const date = now.toISOString().split('T')[0];

  try {
    const flights = await fetchArrivals(DAD_ICAO, date);
    const { error } = await supabase
      .from('flights')
      .upsert(flights, { onConflict: 'airport_iata,flight_number,flight_date' });

    return NextResponse.json({
      date,
      results: { DAD: error ? { error: error.message } : { count: flights.length } },
    });
  } catch (e) {
    return NextResponse.json({
      date,
      results: { DAD: { error: e instanceof Error ? e.message : 'unknown' } },
    });
  }
}
