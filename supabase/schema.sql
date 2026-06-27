-- 항공편 테이블
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_iata TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  airline_iata TEXT,
  airline_name TEXT,
  scheduled_arrival TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT,
  seat_capacity INT NOT NULL DEFAULT 180,
  flight_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (airport_iata, flight_number, flight_date)
);

-- 날짜+공항 기준 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_flights_airport_date
  ON flights (airport_iata, flight_date, scheduled_arrival);

-- Row Level Security: 누구나 읽기 가능, 쓰기는 서비스 키만
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON flights
  FOR SELECT USING (true);

CREATE POLICY "Service write" ON flights
  FOR ALL USING (auth.role() = 'service_role');
