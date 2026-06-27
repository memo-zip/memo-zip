'use client';

import { Flight } from '@/types';

interface Props {
  flights: Flight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function FlightList({ flights, selectedId, onSelect }: Props) {
  if (flights.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        해당 날짜의 도착 항공편이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {flights.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
            selectedId === f.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">{f.flight_number}</span>
              <span className="ml-2 text-sm text-gray-500">{f.airline_name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{formatTime(f.scheduled_arrival)}</div>
              <div className="text-xs text-gray-400">{f.aircraft_type} · {f.seat_capacity}석</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
