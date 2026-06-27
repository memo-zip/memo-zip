export type CongestionLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface Airport {
  iata_code: string;
  name: string;
  name_en: string;
  timezone: string;
  congestion_multiplier: number;
}

export interface Flight {
  id: string;
  airport_iata: string;
  flight_number: string;
  airline_iata: string;
  airline_name: string;
  scheduled_arrival: string;
  aircraft_type: string;
  seat_capacity: number;
  flight_date: string;
}

export interface CongestionResult {
  level: CongestionLevel;
  label: string;
  emoji: string;
  totalPax: number;
  windowStart: string;
  windowEnd: string;
  concurrentFlights: Flight[];
  selectedFlight: Flight;
  estimatedWaitMin: number;
  estimatedWaitMax: number;
  isNightFlight: boolean;
}
