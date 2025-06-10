import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export type Icon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export interface Benefit {
  icon: Icon;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  icon: Icon;
  title: string;
  description: string;
}

// Database Models

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  is_active: boolean;
  created_at: string;
  image_url?: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  website_url?: string;
  phone?: string;
  email?: string;
  address: string;
  city_id: string;
  latitude: number;
  longitude: number;
  hours_of_operation: string;
  what_to_bring: string;
  products: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  image_url?: string;
  added_by_user_id?: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  city: string;
  created_at: string;
  referred_by?: string;
}

export interface CityRequest {
  id: string;
  city_name: string;
  state: string;
  country: string;
  votes: number;
  created_at: string;
}
