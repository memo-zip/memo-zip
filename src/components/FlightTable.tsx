'use client';

import { FlightCongestion, CongestionLevel } from '@/types';
import { THRESHOLDS } from '@/lib/congestion';

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
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-400">마지막 업데이트 {lastUpdated}</span>
        )}
      </div>

      {/* 테이블 */}
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-gray-50 text-gray-400 font-medium">
            <th className="text-left px-2 py-2">시간</th>
            <th className="text-left px-1 py-2">항공사</th>
            <th className="text-left px-1 py-2">편명</th>
            <th className="text-left px-1 py-2">출발지</th>
            <th className="text-left px-1 py-2">기종</th>
            <th className="text-center px-1 py-2">겹침</th>
            <th className="text-center px-1 py-2">예상 대기</th>
            <th className="text-center px-1 py-2 pr-2">패스트트랙</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => {
            const isSelected = row.flight.id === selectedFlightId;
            const dotColor = row.level === 'green' ? 'bg-green-500' : row.level === 'yellow' ? 'bg-yellow-400' : row.level === 'orange' ? 'bg-orange-500' : 'bg-red-500';
            return (
              <tr key={row.flight.id} className={isSelected ? 'bg-red-50' : ''}>
                <td className="px-2 py-2">
                  <span className={`font-bold ${isSelected ? 'text-red-500' : 'text-gray-700'}`}>
                    {formatTime(row.flight.scheduled_arrival)}
                  </span>
                </td>
                <td className="px-1 py-2">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[7px] font-bold text-gray-500 flex-shrink-0">
                      {row.flight.airline_iata}
                    </span>
                    <span className="text-gray-600 truncate max-w-[52px]">{row.flight.airline_name}</span>
                  </div>
                </td>
                <td className="px-1 py-2">
                  <span className={`font-semibold ${isSelected ? 'text-red-500' : 'text-gray-700'}`}>
                    {row.flight.flight_number}
                  </span>
                </td>
                <td className="px-1 py-2 text-gray-500 truncate max-w-[60px]">{row.flight.departure_city ?? '-'}</td>
                <td className="px-1 py-2 text-gray-500">{row.flight.aircraft_type}</td>
                <td className="px-1 py-2 text-center">
                  <span className={`font-semibold ${WAIT_COLORS[row.level]}`}>{row.concurrentCount}대</span>
                </td>
                <td className="px-1 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                    <span className={`font-semibold ${WAIT_COLORS[row.level]}`}>
                      {row.waitMin}~{row.waitMax}분
                    </span>
                  </div>
                </td>
                <td className="px-1 py-2 pr-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                    <span className="text-gray-700">{THRESHOLDS[row.level].label}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 하단 요약 */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
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
