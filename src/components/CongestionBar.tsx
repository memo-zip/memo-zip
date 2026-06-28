'use client';

type Level = 'best' | 'good' | 'normal' | 'busy' | 'very_busy';

interface Props {
  pax: number;
}

function getLevel(pax: number): Level {
  if (pax <= 500) return 'best';
  if (pax <= 900) return 'good';
  if (pax <= 1300) return 'normal';
  if (pax <= 1700) return 'busy';
  return 'very_busy';
}

const LEVEL_CONFIG: Record<Level, { label: string; bars: number; color: string }> = {
  best:     { label: '한산해요',     bars: 1, color: 'bg-green-500' },
  good:     { label: '여유 있어요',  bars: 2, color: 'bg-green-400' },
  normal:   { label: '좀 붐벼요',   bars: 3, color: 'bg-yellow-400' },
  busy:     { label: '많이 붐벼요', bars: 4, color: 'bg-orange-500' },
  very_busy:{ label: '매우 붐벼요', bars: 5, color: 'bg-red-500' },
};

const TOTAL_BARS = 5;

export default function CongestionBar({ pax }: Props) {
  const level = getLevel(pax);
  const { label, bars, color } = LEVEL_CONFIG[level];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-[3px]">
        {Array.from({ length: TOTAL_BARS }).map((_, i) => (
          <div
            key={i}
            className={`w-3 rounded-sm transition-all ${i < bars ? color : 'bg-gray-200'}`}
            style={{ height: `${14 + i * 4}px` }}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-gray-700">{pax.toLocaleString()}명</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
