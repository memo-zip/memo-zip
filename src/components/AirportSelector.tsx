'use client';

import { AIRPORTS } from '@/lib/airports';

interface Props {
  value: string;
  onChange: (iata: string) => void;
}

export default function AirportSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AIRPORTS.map((airport) => (
        <button
          key={airport.iata_code}
          onClick={() => onChange(airport.iata_code)}
          className={`rounded-2xl border-2 p-4 text-center transition-all ${
            value === airport.iata_code
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="text-lg font-bold">{airport.iata_code}</div>
          <div className="text-sm">{airport.name}</div>
        </button>
      ))}
    </div>
  );
}
