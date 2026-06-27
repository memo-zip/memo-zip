// 테스트용 다낭 도착편 목 데이터 (실제 운항 스케줄 기반)
import { Flight } from '@/types';

const MOCK_FLIGHTS_BASE = [
  { flight_number: 'TW0013', airline_iata: 'TW', airline_name: '티웨이항공', time: '22:40', aircraft_type: 'B738', seat_capacity: 189 },
  { flight_number: 'VJ879',  airline_iata: 'VJ', airline_name: 'VietJet Air',  time: '22:05', aircraft_type: 'A320', seat_capacity: 180 },
  { flight_number: '5J5758', airline_iata: '5J', airline_name: '세부퍼시픽',  time: '21:55', aircraft_type: 'A320', seat_capacity: 180 },
  { flight_number: '7C1401', airline_iata: '7C', airline_name: '제주항공',    time: '19:30', aircraft_type: 'B738', seat_capacity: 189 },
  { flight_number: 'LJ139',  airline_iata: 'LJ', airline_name: '진에어',      time: '18:45', aircraft_type: 'B738', seat_capacity: 189 },
  { flight_number: 'BX713',  airline_iata: 'BX', airline_name: '에어부산',    time: '17:20', aircraft_type: 'A321', seat_capacity: 220 },
  { flight_number: 'RS507',  airline_iata: 'RS', airline_name: '에어서울',    time: '15:55', aircraft_type: 'A321', seat_capacity: 195 },
  { flight_number: 'OZ737',  airline_iata: 'OZ', airline_name: '아시아나항공',time: '14:10', aircraft_type: 'A321', seat_capacity: 220 },
  { flight_number: 'KE469',  airline_iata: 'KE', airline_name: '대한항공',    time: '12:30', aircraft_type: 'B738', seat_capacity: 149 },
  { flight_number: 'ZE705',  airline_iata: 'ZE', airline_name: '이스타항공',  time: '23:50', aircraft_type: 'B738', seat_capacity: 189 },
  { flight_number: 'TW0015', airline_iata: 'TW', airline_name: '티웨이항공',  time: '23:20', aircraft_type: 'B738', seat_capacity: 189 },
  { flight_number: 'VJ881',  airline_iata: 'VJ', airline_name: 'VietJet Air',  time: '23:10', aircraft_type: 'A320', seat_capacity: 180 },
];

export function getMockFlights(date: string): Flight[] {
  return MOCK_FLIGHTS_BASE.map((f, i) => ({
    id: `mock-${date}-${i}`,
    airport_iata: 'DAD',
    flight_date: date,
    scheduled_arrival: `${date}T${f.time}:00+07:00`,
    ...f,
  }));
}

export function getDateFromMockId(id: string): string | null {
  // mock-YYYY-MM-DD-N
  const m = id.match(/^mock-(\d{4}-\d{2}-\d{2})-\d+$/);
  return m ? m[1] : null;
}

export const IS_MOCK_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
