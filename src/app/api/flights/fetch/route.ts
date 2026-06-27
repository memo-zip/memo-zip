// Vercel Cron 또는 수동 호출로 AviationStack에서 항공편을 수집해 Supabase에 저장
import { NextRequest, NextResponse } from 'next/server';
import { fetchArrivals } from '@/lib/aviationstack';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // 간단한 시크릿 키 인증
  const auth = req.headers.get('x-cron-secret');
  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { airport_iata, date } = await req.json();
  if (!airport_iata || !date) {
    return NextResponse.json({ error: 'airport_iata and date required' }, { status: 400 });
  }

  try {
    const flights = await fetchArrivals(airport_iata, date);

    // upsert: 같은 항공편이면 덮어쓰기
    const { error } = await supabase
      .from('flights')
      .upsert(flights, { onConflict: 'airport_iata,flight_number,flight_date' });

    if (error) throw error;

    return NextResponse.json({ ok: true, count: flights.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
