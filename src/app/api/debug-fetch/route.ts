import { NextResponse } from 'next/server';
import { fetchArrivals } from '@/lib/aerodatabox';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? '2026-06-29';

  try {
    const flights = await fetchArrivals('DAD', date);
    return NextResponse.json({
      count: flights.length,
      sample: flights.slice(0, 3),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) });
  }
}
