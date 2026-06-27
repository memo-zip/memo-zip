'use client';

import { useState } from 'react';
import AirportSelector from '@/components/AirportSelector';
import FlightList from '@/components/FlightList';
import CongestionResultCard from '@/components/CongestionResult';
import { Flight, CongestionResult } from '@/types';

type Step = 'airport' | 'date' | 'flight' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('airport');
  const [airport, setAirport] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [hasChildren, setHasChildren] = useState(false);
  const [result, setResult] = useState<CongestionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  async function handleDateConfirm() {
    if (!date) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/flights?airport=${airport}&date=${date}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setFlights(json.flights);
      setStep('flight');
    } catch (e) {
      setError(e instanceof Error ? e.message : '항공편을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFlightConfirm() {
    if (!selectedFlightId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/congestion?flight_id=${selectedFlightId}&has_children=${hasChildren}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : '혼잡도를 계산할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('airport');
    setAirport('');
    setDate('');
    setFlights([]);
    setSelectedFlightId(null);
    setHasChildren(false);
    setResult(null);
    setError('');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-1">
          <div className="text-3xl">✈️</div>
          <h1 className="text-xl font-bold text-gray-900">패스트트랙 필요할까?</h1>
          <p className="text-sm text-gray-500">메모집</p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: 공항 선택 */}
        {step === 'airport' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">1. 도착 공항을 선택하세요</h2>
            <AirportSelector value={airport} onChange={setAirport} />
            <button
              disabled={!airport}
              onClick={() => setStep('date')}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: 날짜 선택 */}
        {step === 'date' && (
          <div className="space-y-4">
            <button onClick={() => setStep('airport')} className="text-sm text-gray-500">
              ← 공항 다시 선택
            </button>
            <h2 className="font-semibold text-gray-700">2. 도착 날짜를 선택하세요</h2>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 p-4 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <button
              disabled={!date || loading}
              onClick={handleDateConfirm}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {loading ? '조회 중...' : '항공편 조회'}
            </button>
          </div>
        )}

        {/* Step 3: 항공편 선택 */}
        {step === 'flight' && (
          <div className="space-y-4">
            <button onClick={() => setStep('date')} className="text-sm text-gray-500">
              ← 날짜 다시 선택
            </button>
            <h2 className="font-semibold text-gray-700">3. 내 항공편을 선택하세요</h2>
            <FlightList
              flights={flights}
              selectedId={selectedFlightId}
              onSelect={setSelectedFlightId}
            />

            {/* 아이 동반 옵션 */}
            <label className="flex items-center gap-3 rounded-xl border-2 border-gray-100 bg-white p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
                className="h-5 w-5 accent-blue-600"
              />
              <span className="text-gray-700">👶 아이 동반 (대기시간 추가 반영)</span>
            </label>

            <button
              disabled={!selectedFlightId || loading}
              onClick={handleFlightConfirm}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {loading ? '계산 중...' : '혼잡도 확인'}
            </button>
          </div>
        )}

        {/* Step 4: 결과 */}
        {step === 'result' && result && (
          <div className="space-y-4">
            <CongestionResultCard result={result} />
            <button
              onClick={reset}
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 font-semibold text-gray-700 hover:border-gray-300 transition-colors"
            >
              처음으로
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
