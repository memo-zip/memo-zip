'use client';

import { FlightCongestion, CongestionLevel } from '@/types';
import { THRESHOLDS } from '@/lib/congestion';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
}

const ACCENT_COLORS: Record<CongestionLevel, string> = {
  best:      'bg-green-500',
  good:      'bg-blue-400',
  normal:    'bg-yellow-400',
  busy:      'bg-orange-500',
  very_busy: 'bg-red-500',
};

const TEXT_COLORS: Record<CongestionLevel, string> = {
  best:      'text-green-600',
  good:      'text-blue-500',
  normal:    'text-yellow-600',
  busy:      'text-orange-500',
  very_busy: 'text-red-500',
};

interface Props {
  rows: FlightCongestion[];
  selectedFlightId: string;
  lastUpdated?: string;
  windowStart: string;
  windowEnd: string;
  totalPax: number;
}

export default function FlightTable({ rows, selectedFlightId, lastUpdated, windowStart, windowEnd, totalPax }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* 헤더 */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">다낭 도착 항공편 실시간 스케줄</span>
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-400">마지막 업데이트 {lastUpdated}</span>
        )}
      </div>

      {/* 컬럼 헤더 */}
      <div className="flex items-center pr-4 py-2 bg-gray-50 text-[10px] text-gray-400 font-medium border-b border-gray-100">
        <div className="w-1 mr-3 flex-shrink-0" />
        <div className="w-14 flex-shrink-0 text-center">도착시간</div>
        <div className="flex-1 min-w-0 text-center">항공사 / 출발도시</div>
        <div className="w-16 flex-shrink-0 text-center">편명</div>
        <div className="w-12 flex-shrink-0 text-center">겹침 현황</div>
        <div className="w-20 flex-shrink-0 text-center">혼잡도</div>
      </div>

      {/* 행 목록 */}
      <div className="divide-y divide-gray-50">
        {rows.map((row) => {
          const isSelected = row.flight.id === selectedFlightId;
          const accent = ACCENT_COLORS[row.level];
          const textColor = TEXT_COLORS[row.level];
          const t = THRESHOLDS[row.level];

          return (
            <div
              key={row.flight.id}
              className={`flex items-center pr-4 py-3 ${isSelected ? 'bg-red-50' : ''}`}
            >
              {/* 액센트 바 */}
              <div className={`w-1 self-stretch rounded-r-full flex-shrink-0 mr-3 ${accent}`} />

              {/* 도착 시간 */}
              <div className="w-14 flex-shrink-0 text-center">
                <span className={`text-sm font-black ${isSelected ? 'text-red-500' : 'text-gray-800'}`}>
                  {formatTime(row.flight.scheduled_arrival)}
                </span>
              </div>

              {/* 항공사 + 출발도시 */}
              <div className="flex-1 min-w-0 text-center">
                <div className={`text-xs font-bold truncate ${isSelected ? 'text-red-500' : 'text-gray-800'}`}>
                  {row.flight.airline_name}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {row.flight.departure_city ?? ''} · {row.flight.aircraft_type}
                </div>
              </div>

              {/* 편명 */}
              <div className="w-16 flex-shrink-0 text-center">
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                  {row.flight.flight_number}
                </span>
              </div>

              {/* 겹침 현황 */}
              <div className="w-12 flex-shrink-0 text-center">
                <div className={`text-xs font-bold ${textColor}`}>{row.concurrentCount}대</div>
                <div className="text-[10px] text-gray-400">겹침</div>
              </div>

              {/* 혼잡도 */}
              <div className="w-20 flex-shrink-0 text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent}`} />
                  <span className={`text-xs font-bold ${textColor}`}>{t.label}</span>
                </div>
                <div className={`text-[10px] font-semibold ${textColor} mt-0.5`}>
                  {t.waitMin}~{t.waitMax}분
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 요약 */}
      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>총 입국 예상 인원 ({formatTime(windowStart)} ~ {formatTime(windowEnd)} 도착편 합계)</span>
          <span className="font-bold text-gray-900 ml-2">{totalPax.toLocaleString()}명</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          혼잡 시간대 {formatTime(windowStart)} ~ {formatTime(windowEnd)}
        </div>
      </div>
    </div>
  );
}
