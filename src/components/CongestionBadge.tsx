import { CongestionLevel } from '@/types';
import { THRESHOLDS } from '@/lib/congestion';

const DOT_COLORS: Record<CongestionLevel, string> = {
  best:      'bg-green-500',
  good:      'bg-blue-400',
  normal:    'bg-yellow-400',
  busy:      'bg-orange-500',
  very_busy: 'bg-red-500',
};

interface Props {
  level: CongestionLevel;
  size?: 'sm' | 'md' | 'lg';
  hideLabel?: boolean;
}

export default function CongestionBadge({ level, size = 'md', hideLabel = false }: Props) {
  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-bold' : 'text-sm font-semibold';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${dotSize} ${DOT_COLORS[level]} rounded-full inline-block flex-shrink-0`} />
      {!hideLabel && <span className={`${textSize} text-gray-800`}>{THRESHOLDS[level].label}</span>}
    </span>
  );
}
