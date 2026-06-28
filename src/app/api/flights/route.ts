import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMockFlights, IS_MOCK_MODE } from '@/lib/mock-flights';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const airport = searchParams.get('airport');
  const date = searchParams.get('date');

  if (!airport || !date) {
    return NextResponse.json({ error: 'airport and date required' }, { status: 400 });
  }

  if (IS_MOCK_MODE) {
    const flights = getMockFlights(date);
    return NextResponse.json({ flights, mock: true });
  }

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('airport_iata', airport)
    .eq('flight_date', date)
    .not('departure_city', 'is', null)
    .order('scheduled_arrival', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ flights: data });
}
