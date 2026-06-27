// Vercel Cron: 매일 UTC 15:00 (한국 자정) 실행
// AviationStack 무료 100회/월 기준: 공항 3개 × 내일치 1회 = 3회/일 → 월 93회 이내
import { NextResponse } from 'next/server';
import { fetchArrivals } from '@/lib/aviationstack';
import { supabase } from '@/lib/supabase';
import { AIRPORTS } from '@/lib/airports';

export const maxDuration = 30;

export async function GET() {
  // Vercel Cron은 Authorization: Bearer CRON_SECRET 헤더를 자동 추가
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().split('T')[0];

  const results: Record<string, unknown> = {};

  for (const airport of AIRPORTS) {
    try {
      const flights = await fetchArrivals(airport.iata_code, date);
      const { error } = await supabase
        .from('flights')
        .upsert(flights, { onConflict: 'airport_iata,flight_number,flight_date' });

      results[airport.iata_code] = error ? { error: error.message } : { count: flights.length };
    } catch (e) {
      results[airport.iata_code] = { error: e instanceof Error ? e.message : 'unknown' };
    }
  }

  return NextResponse.json({ date, results });
}
