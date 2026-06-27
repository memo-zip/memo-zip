'use client';

import { CongestionResult } from '@/types';

const LEVEL_STYLES = {
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700'    },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function CongestionResultCard({ result }: { result: CongestionResult }) {
  const style = LEVEL_STYLES[result.level];

  return (
    <div className={`rounded-2xl border-2 ${style.bg} ${style.border} p-6 space-y-6`}>
      {/* 헤더 */}
      <div className="text-center space-y-1">
        <div className="text-4xl">{result.emoji}</div>
        <div className={`text-2xl font-bold ${style.text}`}>
          패스트트랙 {result.label}
        </div>
        <div className="text-gray-500 text-sm">
          {result.selectedFlight.flight_number} ·{' '}
          {formatTime(result.selectedFlight.scheduled_arrival)} 도착
        </div>
      </div>

      {/* 대기 시간 & 인원 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-sm text-gray-500 mb-1">예상 대기시간</div>
          <div className="text-xl font-bold text-gray-800">
            {result.estimatedWaitMin}~{result.estimatedWaitMax}분
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-sm text-gray-500 mb-1">동시간대 입국 인원</div>
          <div className="text-xl font-bold text-gray-800">
            {result.totalPax.toLocaleString()}명
          </div>
        </div>
      </div>

      {/* 조회 시간대 */}
      <div className="bg-white rounded-xl p-4">
        <div className="text-sm text-gray-500 mb-3">
          조회 시간대: {formatTime(result.windowStart)} ~ {formatTime(result.windowEnd)}
        </div>
        <div className="space-y-2">
          {result.concurrentFlights.map((f) => (
            <div key={f.id} className="flex justify-between text-sm">
              <span className={f.id === result.selectedFlight.id ? 'font-bold' : 'text-gray-600'}>
                {f.id === result.selectedFlight.id ? '▶ ' : ''}{f.flight_number}
              </span>
              <span className="text-gray-500">
                {formatTime(f.scheduled_arrival)} · {f.seat_capacity}석
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 야간 가중치 알림 */}
      {result.isNightFlight && (
        <div className="text-center text-sm text-gray-500">
          🌙 야간 도착 편으로 출입국 직원 수가 줄어 혼잡도가 높을 수 있습니다.
        </div>
      )}
    </div>
  );
}
