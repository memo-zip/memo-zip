'use client';

import { useState } from 'react';
import { Flight, CongestionResult } from '@/types';
import { THRESHOLDS } from '@/lib/congestion';
import ScoreDisplay from '@/components/ScoreDisplay';
import CongestionBadge from '@/components/CongestionBadge';
import FlightTable from '@/components/FlightTable';

const AIRPORT = 'DAD';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

export default function Home() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [hasChildren, setHasChildren] = useState(false);
  const [result, setResult] = useState<CongestionResult | null>(null);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState('');
  const [flightsLoaded, setFlightsLoaded] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function loadFlights(d: string) {
    setLoadingFlights(true);
    setError('');
    setFlights([]);
    setSelectedFlightId('');
    setResult(null);
    setFlightsLoaded(false);
    try {
      const res = await fetch(`/api/flights?airport=${AIRPORT}&date=${d}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setFlights(json.flights ?? []);
      setFlightsLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '항공편을 불러올 수 없습니다.');
    } finally {
      setLoadingFlights(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedFlightId) return;
    setLoadingResult(true);
    setError('');
    try {
      const res = await fetch(
        `/api/congestion?flight_id=${selectedFlightId}&has_children=${hasChildren}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석에 실패했습니다.');
    } finally {
      setLoadingResult(false);
    }
  }

  const selectedFlight = flights.find((f) => f.id === selectedFlightId);

  const LEVEL_LABELS: Record<string, string> = {
    green: '패스트트랙이 필요하지 않아요.',
    yellow: '여유 있으면 구매를 고려해보세요.',
    red: '동시간대 입국 인원이 많아 대기 시간이 길 것으로 예상돼요.',
    orange: '동시간대 입국 인원이 많아 패스트트랙을 추천드려요.',
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-gray-900">메모집 🧳</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">다낭 패스트트랙 필요할까?</h1>
            <p className="text-xs text-gray-400 mt-0.5">실시간 입국 대기시간 예측 서비스</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-1 flex items-center gap-1">
              🔒 <span>무단 공유·복제 금지</span>
            </div>
          </div>
        </div>

        {/* 입력 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* 날짜 선택 */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">📅 방문 날짜 선택</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (e.target.value) loadFlights(e.target.value);
                  }}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-red-400 focus:outline-none appearance-none"
                />
              </div>
              {date && <p className="text-xs text-gray-400 mt-1">{formatDate(date)}</p>}
            </div>

            {/* 항공편 선택 */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">✈️ 내 비행편 선택 (편명 입력 또는 선택)</label>
              <div className="relative">
                <select
                  value={selectedFlightId}
                  onChange={(e) => setSelectedFlightId(e.target.value)}
                  disabled={!flightsLoaded || loadingFlights}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-red-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 appearance-none pr-8"
                >
                  <option value="">{loadingFlights ? '불러오는 중...' : '항공편 선택'}</option>
                  {flights.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.flight_number} ({f.airline_name})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
              {selectedFlight && (
                <p className="text-xs text-gray-400 mt-1">{formatTime(selectedFlight.scheduled_arrival)} 도착</p>
              )}
            </div>
          </div>

          {/* 아이 동반 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasChildren}
              onChange={(e) => setHasChildren(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-xs text-gray-600">👶 아이 동반 여행 (혼잡도 가중치 반영)</span>
          </label>

          {/* 분석하기 버튼 */}
          <button
            onClick={handleAnalyze}
            disabled={!selectedFlightId || loadingResult}
            className="w-full rounded-xl bg-red-500 py-3.5 font-bold text-white text-base disabled:opacity-40 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            {loadingResult ? '분석 중...' : '분석하기 →'}
          </button>

          <p className="text-center text-[10px] text-gray-400">
            🛡 본 서비스는 메모집에서만 제공됩니다. 캡처 및 무단 배포를 금지합니다.
          </p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="space-y-4">
            {/* 선택 항공편 요약 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {result.selectedFlight.flight_number}
                    </span>
                    <span className="text-sm text-gray-600">{result.selectedFlight.airline_name}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>⏰ 도착시간 {formatTime(result.selectedFlight.scheduled_arrival)}</span>
                    <span>✈️ 기종 {result.selectedFlight.aircraft_type}</span>
                    <span>💺 좌석수 {result.selectedFlight.seat_capacity}석</span>
                  </div>
                </div>
                <div className="text-4xl">🏖️</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* 점수 */}
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-2">오늘 입국 혼잡도</p>
                  <ScoreDisplay score={result.score} level={result.level} />
                </div>

                {/* 추천 */}
                <div className={`rounded-xl p-3 text-center ${
                  result.level === 'red' ? 'bg-red-50' :
                  result.level === 'orange' ? 'bg-orange-50' :
                  result.level === 'yellow' ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <p className="text-xs text-gray-500 mb-2">오늘 패스트트랙은?</p>
                  <div className="flex justify-center mb-1">
                    <CongestionBadge level={result.level} size="lg" />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight mt-1">
                    {LEVEL_LABELS[result.level]}
                  </p>
                </div>
              </div>

              {/* 3가지 지표 */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">동시간대 입국 예상 인원</div>
                  <div className="text-lg font-black text-gray-900">{result.totalPax.toLocaleString()}명</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {result.level === 'red' ? '매우 혼잡해요' : result.level === 'orange' ? '혼잡해요' : result.level === 'yellow' ? '보통이에요' : '여유로워요'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">예상 대기시간</div>
                  <div className="text-lg font-black text-orange-500">{result.estimatedWaitMin}~{result.estimatedWaitMax}분</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {result.level === 'red' ? '혼잡 시 1시간 이상' : '예상 기준'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">아이 동반 가중치</div>
                  <div className="text-lg font-black text-blue-500">
                    {hasChildren ? '+1단계' : '없음'}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {hasChildren ? '아이 동반 시 추천도 상승' : '해당 없음'}
                  </div>
                </div>
              </div>
            </div>

            {/* 범례 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                {(['green', 'yellow', 'orange', 'red'] as const).map((level) => (
                  <div key={level}>
                    <CongestionBadge level={level} size="sm" />
                    <div className="text-[10px] text-gray-400 mt-1">
                      {THRESHOLDS[level].waitMin}~{THRESHOLDS[level].waitMax === 90 ? '60' : THRESHOLDS[level].waitMax}분
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {level === 'green' ? '일반 입국 추천' :
                       level === 'yellow' ? '아이 없으면 비추천' :
                       level === 'orange' ? '아이 동반·밤 도착 시 추천' :
                       '가족여행 강력 추천'}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                ⓘ 예측 데이터는 항공사 스케줄, 좌석수, 시간대, 성수기 등을 기반으로 산출됩니다.
              </p>
            </div>

            {/* 항공편 테이블 */}
            <FlightTable
              rows={result.flightRows}
              selectedFlightId={result.selectedFlight.id}
              lastUpdated={new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              windowStart={result.windowStart}
              windowEnd={result.windowEnd}
              totalPax={result.totalPax}
            />

            {/* 저작권 */}
            <div className="text-center space-y-1 pt-2">
              <div className="text-[10px] text-gray-400 bg-gray-100 rounded-xl px-4 py-2">
                🚫 무단 캡처 및 공유, 복제, 2차 가공을 금지합니다.<br />
                메모집의 모든 콘텐츠는 직접 수집·분석한 데이터로, 무단 사용 시 법적 조치를 받을 수 있습니다.
              </div>
              <p className="text-[10px] text-gray-400">© MEMOZIP. All rights reserved.</p>
            </div>
          </div>
        )}

        {/* 날짜만 선택되고 결과 없을 때 안내 */}
        {!result && flightsLoaded && flights.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
            해당 날짜의 다낭 도착편 데이터가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
