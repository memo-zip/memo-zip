import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateCongestion } from '@/lib/congestion';
import { AIRPORTS } from '@/lib/airports';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightId = searchParams.get('flight_id');
  const hasChildren = searchParams.get('has_children') === 'true';

  if (!flightId) {
    return NextResponse.json({ error: 'flight_id required' }, { status: 400 });
  }

  const { data: selectedFlight, error: e1 } = await supabase
    .from('flights')
    .select('*')
    .eq('id', flightId)
    .single();

  if (e1 || !selectedFlight) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  const { data: allFlights, error: e2 } = await supabase
    .from('flights')
    .select('*')
    .eq('airport_iata', selectedFlight.airport_iata)
    .eq('flight_date', selectedFlight.flight_date);

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  const airport = AIRPORTS.find((a) => a.iata_code === selectedFlight.airport_iata);
  const result = calculateCongestion(
    selectedFlight,
    allFlights ?? [],
    airport?.congestion_multiplier ?? 1.0,
    hasChildren,
  );

  return NextResponse.json(result);
}
