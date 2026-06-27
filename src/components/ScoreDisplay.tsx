'use client';

import { CongestionLevel } from '@/types';

const SCORE_COLORS: Record<CongestionLevel, string> = {
  green:  'text-green-500',
  yellow: 'text-yellow-500',
  orange: 'text-orange-500',
  red:    'text-red-500',
};

interface Props {
  score: number;
  level: CongestionLevel;
}

export default function ScoreDisplay({ score, level }: Props) {
  const stars = score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1;

  return (
    <div className="text-center">
      <div className={`text-6xl font-black ${SCORE_COLORS[level]}`}>{score}<span className="text-2xl font-bold text-gray-400">점</span></div>
      <div className="flex justify-center gap-0.5 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <svg key={i} className={`w-5 h-5 ${i <= stars ? 'text-orange-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
