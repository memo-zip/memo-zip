'use client';

import { useState } from 'react';
import { Flight, CongestionResult } from '@/types';
import { THRESHOLDS } from '@/lib/congestion';
import CongestionBar from '@/components/CongestionBar';
import CongestionBadge from '@/components/CongestionBadge';
import FlightTable from '@/components/FlightTable';

const AIRPORTS = [
  { iata: 'DAD', label: '다낭' },
  { iata: 'CXR', label: '나트랑' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

function NoticeBox() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs font-bold text-gray-700 mb-3">ℹ️ 이용 안내</p>
      <ul className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
        <li>• <span className="font-semibold text-gray-700">최대 30일 후</span>까지의 항공편을 조회할 수 있습니다. <span className="text-gray-400">(매일 자동으로 데이터가 업데이트됩니다.)</span></li>
        <li>• 혼잡도는 도착 예정 시간 기준 <span className="font-semibold text-gray-700">이전 1시간 내</span> 도착하는 항공편 수와 좌석 수를 바탕으로 산정됩니다.</li>
        <li>• 다낭 국제공항(DAD) · 나트랑 깜라인 국제공항(CXR) <span className="font-semibold text-gray-700">국제선 입국편</span>만 제공됩니다.</li>
        <li>• 본 서비스는 실시간 공항 혼잡도를 제공하지 않습니다.</li>
        <li>• 항공사 사정에 따라 지연, 결항 및 시간 변경이 발생할 수 있습니다.</li>
        <li>• 패스트트랙 구매 여부를 판단하기 위한 <span className="font-semibold text-gray-700">참고용 정보</span>이며 실제 공항 상황과 차이가 있을 수 있습니다.</li>
        <li>• 항공 데이터는 AeroDataBox를 기반으로 하며 일부 항공편이 누락될 수 있습니다.</li>
        <li>• 본 서비스를 이용한 패스트트랙 구매 및 이용 결과에 대한 책임은 이용자에게 있습니다.</li>
        <li>• 본 서비스는 <span className="font-semibold text-gray-700">메모집이 직접 제작·운영</span>하며, 무단 캡처·복제·재배포를 금지합니다.</li>
      </ul>
    </div>
  );
}

export default function Home() {
  const [airport, setAirport] = useState('DAD');
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

  async function loadFlights(d: string, ap: string = airport) {
    setLoadingFlights(true);
    setError('');
    setFlights([]);
    setSelectedFlightId('');
    setResult(null);
    setFlightsLoaded(false);
    try {
      const res = await fetch(`/api/flights?airport=${ap}&date=${d}`);
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
    best:      '아이와 함께여도 여유롭게 입국할 수 있어요.',
    good:      '아이와 함께여도 크게 불편하지 않아요.',
    normal:    '아이 동반이라면 패스트트랙을 고려해보세요.',
    busy:      '아이와 긴 줄에 서는 것보다 패스트트랙을 추천해요.',
    very_busy: '아이 동반 가족여행이라면 패스트트랙이 필수예요.',
  };

  const RECOMMENDATION_BADGE: Record<string, { emoji: string; label: string; bg: string; text: string }> = {
    best:      { emoji: '💸', label: '패스트트랙 비추천', bg: 'bg-gray-100',   text: 'text-gray-500'   },
    good:      { emoji: '💸', label: '패스트트랙 비추천', bg: 'bg-gray-100',   text: 'text-gray-500'   },
    normal:    { emoji: '🤔', label: '아이 있으면 추천',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
    busy:      { emoji: '👍', label: '추천',              bg: 'bg-orange-100', text: 'text-orange-600' },
    very_busy: { emoji: '🔥', label: '강력추천',          bg: 'bg-red-100',    text: 'text-red-600'    },
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-black text-gray-900">메모집 🧳</p>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">다낭 패스트트랙<br />필요할까?</h1>
            <p className="text-xs text-gray-400 mt-1">실시간 입국 대기시간 예측 서비스</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 mt-1">
            <div className="text-[10px] text-gray-400 border border-gray-200 rounded-lg px-2 py-1 flex items-center gap-1 whitespace-nowrap">
              🔒 무단 공유·복제 금지
            </div>
            <a href="https://www.instagram.com/memozip_usb/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-pink-500 flex items-center gap-1 whitespace-nowrap">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              @memozip_usb
            </a>
          </div>
        </div>

        {/* 공항 탭 */}
        <div className="flex gap-2">
          {AIRPORTS.map((ap) => (
            <button
              key={ap.iata}
              onClick={() => {
                setAirport(ap.iata);
                setResult(null);
                setFlights([]);
                setSelectedFlightId('');
                setFlightsLoaded(false);
                if (date) loadFlights(date, ap.iata);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                airport === ap.iata
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              {ap.label}
            </button>
          ))}
        </div>

        {/* 입력 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 items-start">
            {/* 날짜 선택 */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">📅 방문 날짜 선택</label>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (e.target.value) loadFlights(e.target.value);
                  }}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none appearance-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 h-4">
                {date ? formatDate(date) : ''}
              </p>
            </div>

            {/* 항공편 선택 */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">✈️ 내 비행편 선택</label>
              <div className="relative flex-1">
                <select
                  value={selectedFlightId}
                  onChange={(e) => setSelectedFlightId(e.target.value)}
                  disabled={!flightsLoaded || loadingFlights}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-red-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 appearance-none pr-8"
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
              <p className="text-xs text-gray-400 mt-1.5 h-4">
                {selectedFlight ? `${formatTime(selectedFlight.scheduled_arrival)} 도착` : ''}
              </p>
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

        {/* 결과 없을 때만 이용 안내 표시 */}
        {!result && <NoticeBox />}

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
                  <CongestionBar pax={result.totalPax} />
                </div>

                {/* 추천 */}
                <div className={`rounded-xl p-3 text-center ${
                  result.level === 'very_busy' ? 'bg-red-50' :
                  result.level === 'busy' ? 'bg-orange-50' :
                  result.level === 'normal' ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <p className="text-xs text-gray-500 mb-2">오늘 패스트트랙은?</p>
                  <div className="flex justify-center mb-2">
                    <span className={`inline-flex items-center gap-1 text-base font-bold px-3 py-1.5 rounded-full ${RECOMMENDATION_BADGE[result.level].bg} ${RECOMMENDATION_BADGE[result.level].text}`}>
                      {RECOMMENDATION_BADGE[result.level].emoji} {RECOMMENDATION_BADGE[result.level].label}
                    </span>
                  </div>
                  <div className="flex justify-center mb-1">
                    <CongestionBadge level={result.level} size="sm" />
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
                    {result.level === 'very_busy' ? '매우 붐벼요' : result.level === 'busy' ? '많이 붐벼요' : result.level === 'normal' ? '좀 붐벼요' : result.level === 'good' ? '적당해요' : '한산해요'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">예상 대기시간</div>
                  <div className={`text-lg font-black ${result.level === 'best' ? 'text-green-600' : result.level === 'good' ? 'text-blue-500' : result.level === 'normal' ? 'text-yellow-600' : result.level === 'busy' ? 'text-orange-500' : 'text-red-500'}`}>{result.estimatedWaitMin}~{result.estimatedWaitMax}분</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {result.level === 'very_busy' ? '혼잡 시 1시간 이상' : '예상 기준'}
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
              <div className="grid grid-cols-5 gap-2 text-center">
                {(['best', 'good', 'normal', 'busy', 'very_busy'] as const).map((level) => {
                  const subLabel = {
                    best:      '일반입국 추천',
                    good:      '일반입국 추천',
                    normal:    '아이있으면 고려',
                    busy:      '아이동반·밤도착추천',
                    very_busy: '가족여행강력추천',
                  }[level];
                  return (
                    <div key={level} className="flex flex-col items-center gap-1">
                      <CongestionBadge level={level} size="sm" />
                      <div className="text-[10px] text-gray-400">
                        {THRESHOLDS[level].waitMin}~{THRESHOLDS[level].waitMax}분
                      </div>
                      <div className="text-[9px] text-gray-400 leading-tight">{subLabel}</div>
                    </div>
                  );
                })}
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

            {/* 이용 안내 */}
            <NoticeBox />

            {/* 저작권 */}
            <div className="flex items-center justify-center gap-4 py-4">
              <svg width="70" height="70" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#ef4444" strokeWidth="3"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
                <path id="stampCircle" d="M50,50 m-32,0 a32,32 0 1,1 64,0 a32,32 0 1,1 -64,0" fill="none"/>
                <text fontSize="9" fontWeight="bold" fill="#ef4444" fontFamily="Arial, sans-serif" letterSpacing="3">
                  <textPath href="#stampCircle" startOffset="8%">MEMOZIP · DANANG FASTTRACK ·</textPath>
                </text>
                <text x="50" y="46" textAnchor="middle" fontSize="11" fontWeight="900" fill="#ef4444" fontFamily="Arial, sans-serif">메모집</text>
                <text x="50" y="60" textAnchor="middle" fontSize="7" fill="#ef4444" fontFamily="Arial, sans-serif" letterSpacing="1">MEMOZIP</text>
              </svg>
              <div className="text-center">
                <p className="text-[11px] text-gray-500">무단 캡처 및 공유, 복제, 2차 가공을 금지합니다.</p>
                <p className="text-[10px] text-gray-400 mt-1">© MEMOZIP. All rights reserved.</p>
                <a href="https://www.instagram.com/memozip_usb/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-pink-500 hover:text-pink-600">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  @memozip_usb
                </a>
              </div>
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
