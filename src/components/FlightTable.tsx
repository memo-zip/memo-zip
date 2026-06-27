'use client';

import { FlightCongestion, CongestionLevel } from '@/types';
import CongestionBadge from './CongestionBadge';

const WAIT_COLORS: Record<CongestionLevel, string> = {
  green:  'text-green-600',
  yellow: 'text-yellow-600',
  orange: 'text-orange-600',
  red:    'text-red-600',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

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
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">다낭 도착 항공편 실시간 스케줄</span>
          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">LIVE</span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-400">마지막 업데이트 {lastUpdated} 🔄</span>
        )}
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[60px_1fr_70px_60px_50px_70px_70px] gap-1 px-3 py-2 bg-gray-50 text-xs text-gray-400 font-medium">
        <span>도착시간</span>
        <span>항공사</span>
        <span>편명</span>
        <span>기종</span>
        <span>좌석수</span>
        <span>예상 대기</span>
        <span>패스트트랙</span>
      </div>

      {/* 행 */}
      <div className="divide-y divide-gray-50">
        {rows.map((row) => {
          const isSelected = row.flight.id === selectedFlightId;
          return (
            <div
              key={row.flight.id}
              className={`grid grid-cols-[60px_1fr_70px_60px_50px_70px_70px] gap-1 px-3 py-2.5 items-center text-xs transition-colors ${
                isSelected ? 'bg-red-50' : ''
              }`}
            >
              <span className={`font-bold ${isSelected ? 'text-red-500' : 'text-gray-700'}`}>
                {formatTime(row.flight.scheduled_arrival)}
              </span>
              <div className="flex items-center gap-1 min-w-0">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 flex-shrink-0">
                  {row.flight.airline_iata}
                </span>
                <span className="text-gray-600 truncate">{row.flight.airline_name}</span>
              </div>
              <span className={`font-semibold ${isSelected ? 'text-red-500' : 'text-gray-700'}`}>
                {row.flight.flight_number}
              </span>
              <span className="text-gray-500">{row.flight.aircraft_type}</span>
              <span className="text-gray-500">{row.flight.seat_capacity}석</span>
              <span className={`font-semibold ${WAIT_COLORS[row.level]}`}>
                {row.waitMin}~{row.waitMax}분
              </span>
              <div>
                <CongestionBadge level={row.level} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 요약 */}
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs">총 입국 예상 인원 ({formatTime(windowStart)} ~ {formatTime(windowEnd)} 도착편 합계)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900">{totalPax.toLocaleString()}명</span>
          <span className="text-xs text-gray-500">혼잡 시간대 {formatTime(windowStart)} ~ {formatTime(windowEnd)}</span>
        </div>
      </div>
    </div>
  );
}
