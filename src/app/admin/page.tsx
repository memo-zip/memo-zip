'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flight } from '@/types';

// 다낭 도착 주요 항공사 + 기종 참고 데이터
const AIRLINE_PRESETS = [
  { iata: 'TW', name: '티웨이항공' },
  { iata: '7C', name: '제주항공' },
  { iata: 'LJ', name: '진에어' },
  { iata: 'BX', name: '에어부산' },
  { iata: 'RS', name: '에어서울' },
  { iata: 'OZ', name: '아시아나항공' },
  { iata: 'KE', name: '대한항공' },
  { iata: 'ZE', name: '이스타항공' },
  { iata: 'VJ', name: 'VietJet Air' },
  { iata: '5J', name: '세부퍼시픽' },
];

const AIRCRAFT_PRESETS: Record<string, number> = {
  B738: 189, B737: 149, A320: 180, A321: 220,
};

function formatLocalTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 새 항공편 입력 폼
  const [form, setForm] = useState({
    flight_number: '',
    airline_iata: '',
    airline_name: '',
    arrival_time: '',  // HH:MM (현지시간)
    aircraft_type: 'B738',
    seat_capacity: 189,
  });

  async function loadFlights() {
    setLoading(true);
    try {
      const res = await fetch(`/api/flights?airport=DAD&date=${date}`);
      const json = await res.json();
      setFlights(json.flights ?? []);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (authed) loadFlights(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [authed, date]);

  async function addFlight() {
    if (!form.flight_number || !form.arrival_time) return;

    // HH:MM → ISO (베트남 UTC+7)
    const scheduledArrival = `${date}T${form.arrival_time}:00+07:00`;

    const res = await fetch('/api/admin/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({
        airport_iata: 'DAD',
        flight_number: form.flight_number.toUpperCase(),
        airline_iata: form.airline_iata,
        airline_name: form.airline_name,
        scheduled_arrival: scheduledArrival,
        aircraft_type: form.aircraft_type,
        seat_capacity: form.seat_capacity,
        flight_date: date,
      }),
    });

    if (res.ok) {
      setMsg('항공편 추가됨');
      setForm({ ...form, flight_number: '', arrival_time: '' });
      loadFlights();
    } else {
      const json = await res.json();
      setMsg(`오류: ${json.error}`);
    }
    setTimeout(() => setMsg(''), 3000);
  }

  async function deleteFlight(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/flights/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
    if (res.ok) loadFlights();
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 space-y-4 w-80 shadow-sm">
          <h1 className="font-bold text-lg text-gray-900">관리자 로그인</h1>
          <input
            type="password"
            placeholder="관리자 키"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setAuthed(true)}
            className="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold"
          >
            확인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">✈️ 다낭 항공편 관리</h1>
          <Link href="/" className="text-sm text-blue-600">← 서비스로</Link>
        </div>

        {/* 날짜 선택 */}
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none"
          />
          <span className="text-sm text-gray-500">{flights.length}편 등록됨</span>
          {loading && <span className="text-sm text-gray-400">불러오는 중...</span>}
        </div>

        {/* 항공편 목록 */}
        <div className="bg-white rounded-2xl divide-y divide-gray-100">
          {flights.length === 0 && (
            <p className="p-6 text-center text-gray-400 text-sm">등록된 항공편이 없습니다.</p>
          )}
          {flights.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-4">
              <div>
                <span className="font-bold text-gray-900">{f.flight_number}</span>
                <span className="ml-2 text-sm text-gray-500">{f.airline_name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">{formatLocalTime(f.scheduled_arrival)}</span>
                <span className="text-sm text-gray-400">{f.aircraft_type} · {f.seat_capacity}석</span>
                <button
                  onClick={() => deleteFlight(f.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 폼 */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">항공편 추가</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">편명 *</label>
              <input
                placeholder="TW0013"
                value={form.flight_number}
                onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">도착 시간 (현지) *</label>
              <input
                type="time"
                value={form.arrival_time}
                onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">항공사</label>
              <select
                value={form.airline_iata}
                onChange={(e) => {
                  const preset = AIRLINE_PRESETS.find(a => a.iata === e.target.value);
                  setForm({ ...form, airline_iata: e.target.value, airline_name: preset?.name ?? '' });
                }}
                className="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none"
              >
                <option value="">선택</option>
                {AIRLINE_PRESETS.map(a => (
                  <option key={a.iata} value={a.iata}>{a.name} ({a.iata})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">기종</label>
              <select
                value={form.aircraft_type}
                onChange={(e) => setForm({
                  ...form,
                  aircraft_type: e.target.value,
                  seat_capacity: AIRCRAFT_PRESETS[e.target.value] ?? form.seat_capacity,
                })}
                className="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(AIRCRAFT_PRESETS).map(([type, seats]) => (
                  <option key={type} value={type}>{type} ({seats}석)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">좌석 수</label>
            <input
              type="number"
              value={form.seat_capacity}
              onChange={(e) => setForm({ ...form, seat_capacity: Number(e.target.value) })}
              className="w-32 rounded-xl border-2 border-gray-200 p-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {msg && (
            <div className={`text-sm p-3 rounded-xl ${msg.startsWith('오류') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg}
            </div>
          )}

          <button
            onClick={addFlight}
            disabled={!form.flight_number || !form.arrival_time}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </main>
  );
}
