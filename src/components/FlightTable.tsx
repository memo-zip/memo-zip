'use client';

import { FlightCongestion, CongestionLevel } from '@/types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
}

const BAR_COLORS: Record<CongestionLevel, string> = {
  best:      'bg-green-500',
  good:      'bg-blue-400',
  normal:    'bg-yellow-400',
  busy:      'bg-orange-500',
  very_busy: 'bg-red-500',
};

const PAX_COLORS: Record<CongestionLevel, string> = {
  best:      'text-green-600',
  good:      'text-blue-500',
  normal:    'text-yellow-600',
  busy:      'text-orange-500',
  very_busy: 'text-red-500',
};

const LEVEL_BARS: Record<CongestionLevel, number> = {
  best: 1, good: 2, normal: 3, busy: 4, very_busy: 5,
};

function MiniBar({ level }: { level: CongestionLevel }) {
  const filled = LEVEL_BARS[level];
  const color = BAR_COLORS[level];
  return (
    <div className="flex items-end gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-sm ${i < filled ? color : 'bg-gray-200'}`}
          style={{ height: `${8 + i * 3}px` }}
        />
      ))}
    </div>
  );
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
      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">다낭 도착 항공편 실시간 스케줄</span>
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-400">마지막 업데이트 {lastUpdated}</span>
        )}
      </div>

      {/* 테이블 */}
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: '22%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 text-[10px] text-gray-400 font-medium">
            <th className="text-left px-4 py-2.5">항공사</th>
            <th className="text-center px-1 py-2.5">편명</th>
            <th className="text-center px-1 py-2.5">기종</th>
            <th className="text-center px-1 py-2.5">출발지</th>
            <th className="text-center px-1 py-2.5">도착 시간</th>
            <th className="text-center px-2 py-2.5">혼잡도</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => {
            const isSelected = row.flight.id === selectedFlightId;
            return (
              <tr key={row.flight.id} className={`${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}>
                {/* 항공사 */}
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-red-500' : 'text-gray-800'}`}>
                    {row.flight.airline_name}
                  </span>
                </td>
                {/* 편명 */}
                <td className="px-1 py-3.5 text-center">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                    {row.flight.flight_number}
                  </span>
                </td>
                {/* 기종 */}
                <td className="px-1 py-3.5 text-center">
                  <div className="text-xs text-gray-500">{row.flight.aircraft_type}</div>
                  <div className="text-[10px] text-gray-400">({row.flight.seat_capacity}석)</div>
                </td>
                {/* 출발지 */}
                <td className="px-1 py-3.5 text-center">
                  <span className="text-xs text-gray-500 truncate block">{row.flight.departure_city ?? ''}</span>
                </td>
                {/* 도착 시간 */}
                <td className="px-1 py-3.5 text-center">
                  <span className={`text-sm font-bold ${isSelected ? 'text-red-500' : 'text-gray-800'}`}>
                    {formatTime(row.flight.scheduled_arrival)}
                  </span>
                </td>
                {/* 혼잡도 */}
                <td className="px-2 py-3.5">
                  <div className="flex flex-col items-center gap-1">
                    <MiniBar level={row.level} />
                    <span className={`text-[10px] font-bold ${PAX_COLORS[row.level]}`}>
                      {row.totalPax.toLocaleString()}명
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
