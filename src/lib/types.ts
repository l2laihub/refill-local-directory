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

export interface StoreHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface StoreHoursOfOperation {
  monday: StoreHours;
  tuesday: StoreHours;
  wednesday: StoreHours;
  thursday: StoreHours;
  friday: StoreHours;
  saturday: StoreHours;
  sunday: StoreHours;
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
  hours_of_operation: string | StoreHoursOfOperation | null;
  what_to_bring: string;
  products: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  image_url?: string;
  added_by_user_id?: string;
  google_place_id?: string; // For linking to Google data and reviews
}

export interface StoreReview {
  id: string;
  store_id: string;
  review_id_external?: string;
  place_id?: string;
  author_name?: string;
  author_id_external?: string;
  review_text?: string;
  rating: number;
  review_datetime_utc: string;
  owner_answer?: string;
  owner_answer_datetime_utc?: string;
  likes_count: number;
  review_source: string;
  created_at: string;
  updated_at: string;
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
export interface StoreUpdateSuggestion {
  id: string;
  store_id: string;
  user_id: string | null;
  suggested_changes: Record<string, any>; // Or a more specific type for changes
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  store_name?: string; // Populated from joined stores table
  user_display_name?: string; // Populated from joined users table
  // Optional: Include user details if you plan to join and display them
  // user?: { display_name?: string; avatar_url?: string };
}

// Re-adding the type required by the Google Places service
export interface GooglePlaceSearchResultItem {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  business_status?: string;
  photos?: any[];
  website?: string;
  international_phone_number?: string;
  opening_hours?: any;
  rating?: number;
  user_ratings_total?: number;
}
