// Vercel Cron: 매일 UTC 15:00 (베트남 자정 +7) 실행
// AeroDataBox로 오늘~7일 후 다낭 도착편 수집
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  // date 파라미터 있으면 그 날짜만, 없으면 오늘~7일 후
  const dates = dateParam
    ? [dateParam]
    : Array.from({ length: 7 }, (_, i) => getDateStr(i));

  const results: Record<string, unknown> = {};

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    if (i > 0) await new Promise(r => setTimeout(r, 4000));
    try {
      const flights = await fetchArrivals('DAD', date);
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
