import { supabase } from './supabase';
import type { City, Store, WaitlistEntry, CityRequest } from './types';

// City Services
export const cityServices = {
  // Get all active cities
  async getActiveCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Get city by slug
  async getCityBySlug(slug: string): Promise<City | null> {
    // Normalize the slug to lowercase and handle hyphenation
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');
    
    console.log(`Fetching city with normalized slug: ${normalizedSlug}`);
    
    // First try with exact slug match
    let { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('slug', normalizedSlug);
    
    if (error) {
      console.error(`Error fetching city with slug ${normalizedSlug}:`, error);
      return null;
    }
    
    // If we found exactly one result, return it
    if (data && data.length === 1) {
      return data[0];
    }
    
    // If we didn't find an exact match, try a more flexible approach
    // by matching the name directly
    ({ data, error } = await supabase
      .from('cities')
      .select('*')
      .ilike('name', slug));
    
    if (error) {
      console.error(`Error fetching city with name ${slug}:`, error);
      return null;
    }
    
    // Return the first match if any were found
    if (data && data.length > 0) {
      return data[0];
    }
    
    console.error(`No city found with slug ${normalizedSlug} or name ${slug}`);
    return null;
  },
  
  // Request a new city
  async requestCity(cityName: string, state: string, country: string): Promise<boolean> {
    const { error } = await supabase
      .from('city_requests')
      .insert([{ city_name: cityName, state, country }])
      .select();
    
    if (error) {
      // If the error is a unique constraint violation, try to increment the votes
      if (error.code === '23505') {
        const { error: updateError } = await supabase.rpc('increment_city_request_votes', {
          city_name_param: cityName,
          state_param: state,
          country_param: country
        });
        
        if (updateError) {
          console.error('Error incrementing votes for city request:', updateError);
          return false;
        }
        
        return true;
      }
      
      console.error('Error requesting new city:', error);
      return false;
    }
    
    return true;
  }
};

// Store Services
export const storeServices = {
  // Get stores by city ID
  async getStoresByCity(cityId: string): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('city_id', cityId)
      .eq('is_verified', true)
      .order('name');
    
    if (error) {
      console.error(`Error fetching stores for city ${cityId}:`, error);
      return [];
    }
    
    return data || [];
  },
  
  // Get store by ID
  async getStoreById(id: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching store with ID ${id}:`, error);
      return null;
    }
    
    return data;
  }
};

// Waitlist Services
export const waitlistServices = {
  // Add email to waitlist
  async addToWaitlist(email: string, city: string, referredBy?: string): Promise<boolean> {
    const entry: Partial<WaitlistEntry> = {
      email,
      city,
      ...(referredBy && { referred_by: referredBy })
    };
    
    const { error } = await supabase
      .from('waitlist')
      .insert([entry]);
    
    if (error) {
      console.error('Error adding to waitlist:', error);
      return false;
    }
    
    return true;
  }
};

// Helper function to detect if a string is a valid UUID
export function isUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
