// src/app/models/event.model.ts

export interface Event {
  id: number;
  name: string;
  description?: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  ticket_price: number;
  goal_amount: number;
  current_amount: number;
  category_id: number;
  category_name: string;
  is_active: boolean;
  registrations?: Registration[];
}

export interface Registration {
  id: number;
  event_id: number;
  full_name: string;
  email: string;
  phone?: string;
  tickets_count: number;
  total_amount: number;
  registration_date: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface WeatherData {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface CreateRegistration {
  event_id: number;
  full_name: string;
  email: string;
  phone?: string;
  tickets_count: number;
}