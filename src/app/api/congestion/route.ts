import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateCongestion } from '@/lib/congestion';
import { AIRPORTS } from '@/lib/airports';
import { getMockFlights, getDateFromMockId, IS_MOCK_MODE } from '@/lib/mock-flights';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightId = searchParams.get('flight_id');
  const hasChildren = searchParams.get('has_children') === 'true';

  if (!flightId) {
    return NextResponse.json({ error: 'flight_id required' }, { status: 400 });
  }

  let selectedFlight, allFlights;

  if (IS_MOCK_MODE) {
    const date = getDateFromMockId(flightId);
    if (!date) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    const mockFlights = getMockFlights(date);
    selectedFlight = mockFlights.find((f) => f.id === flightId);
    if (!selectedFlight) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    allFlights = mockFlights;
  } else {
    const { data: sf, error: e1 } = await supabase
      .from('flights').select('*').eq('id', flightId).single();
    if (e1 || !sf) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    selectedFlight = sf;

    const { data: af, error: e2 } = await supabase
      .from('flights').select('*')
      .eq('airport_iata', selectedFlight.airport_iata)
      .eq('flight_date', selectedFlight.flight_date);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    allFlights = af ?? [];
  }

  const airport = AIRPORTS.find((a) => a.iata_code === selectedFlight.airport_iata);
  const result = calculateCongestion(
    selectedFlight,
    allFlights,
    airport?.congestion_multiplier ?? 1.0,
    hasChildren,
  );

  return NextResponse.json(result);
}
