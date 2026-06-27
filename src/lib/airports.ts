import { Airport } from '@/types';

export const AIRPORTS: Airport[] = [
  {
    iata_code: 'DAD',
    name: '다낭',
    name_en: 'Da Nang',
    timezone: 'Asia/Ho_Chi_Minh',
    congestion_multiplier: 1.0,
  },
  {
    iata_code: 'CXR',
    name: '나트랑',
    name_en: 'Nha Trang (Cam Ranh)',
    timezone: 'Asia/Ho_Chi_Minh',
    congestion_multiplier: 0.9,
  },
  {
    iata_code: 'PQC',
    name: '푸꾸옥',
    name_en: 'Phu Quoc',
    timezone: 'Asia/Ho_Chi_Minh',
    congestion_multiplier: 0.85,
  },
];
