import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? '2026-06-29';
  const apiKey = process.env.AERODATABOX_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'no key' });

  const headers = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
  };

  const url = `https://aerodatabox.p.rapidapi.com/flights/airports/icao/VVDN/${date}T12:00/${date}T23:59?withLeg=true&direction=Arrival&withCancelled=false`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  try {
    return NextResponse.json({ status: res.status, url, body: JSON.parse(text) });
  } catch {
    return NextResponse.json({ status: res.status, url, raw: text });
  }
}
