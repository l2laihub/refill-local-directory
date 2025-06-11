import { supabase } from './supabase';
import type { City, Store, WaitlistEntry, CityRequest } from './types';

// City Services
export const cityServices = {
  // Get all cities (both active and inactive)
  async getAllCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching all cities:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Get all active cities
  async getActiveCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching active cities:', error);
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
  },

  // Get all unverified stores for moderation
  async getUnverifiedStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*, cities (name, slug)') // Fetch related city name for context
      .eq('is_verified', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching unverified stores:', error);
      return [];
    }
    // Ensure hours_of_operation is treated as string if it's JSONB from DB
    return (data?.map(store => ({
      ...store,
      hours_of_operation: typeof store.hours_of_operation === 'object'
        ? JSON.stringify(store.hours_of_operation)
        : store.hours_of_operation
    })) || []) as Store[];
  },

  // Approve a store submission by calling stored procedure
  async approveStore(storeId: string): Promise<Store | null> {
    const { data, error } = await supabase.rpc('approve_submitted_store', {
      p_store_id: storeId,
    });

    if (error) {
      console.error(`Error approving store ${storeId} via RPC:`, error);
      return null;
    }
    return data as Store | null;
  },

  // Reject (delete) a store submission by calling stored procedure
  async rejectStore(storeId: string): Promise<boolean> {
    const { error } = await supabase.rpc('reject_submitted_store', {
      p_store_id: storeId,
    });

    if (error) {
      console.error(`Error rejecting store ${storeId} via RPC:`, error);
      return false;
    }
    return true;
  },

  // Add a new store by calling stored procedure
  async addStore(
    storeData: Omit<Store, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'added_by_user_id'>,
    submitterUserId?: string | null
  ): Promise<Store | null> {
    const params = {
      p_name: storeData.name,
      p_description: storeData.description,
      p_address: storeData.address,
      p_city_id: storeData.city_id,
      p_latitude: storeData.latitude,
      p_longitude: storeData.longitude,
      // Ensure hours_of_operation is a string for the RPC call, as the form provides it as such.
      // The SP will attempt to_jsonb conversion.
      p_hours_of_operation: typeof storeData.hours_of_operation === 'string'
        ? storeData.hours_of_operation
        : JSON.stringify(storeData.hours_of_operation),
      p_what_to_bring: storeData.what_to_bring,
      p_products: storeData.products,
      p_website_url: storeData.website_url || null,
      p_phone: storeData.phone || null,
      p_email: storeData.email || null,
      p_image_url: storeData.image_url || null,
      p_submitter_user_id: submitterUserId || null,
    };

    const { data, error } = await supabase.rpc('add_store_submission', params);

    if (error) {
      console.error('Error adding store via RPC:', error);
      // Specific error handling for foreign key or other known issues can be added here
      if (error.message.includes('violates foreign key constraint "stores_city_id_fkey"')) {
         console.error('Error adding store: Invalid city_id provided.');
      } else if (error.message.includes('invalid input syntax for type json')) {
        console.error('Error adding store: Hours of operation format is invalid for JSON conversion.');
      }
      return null;
    }
    return data as Store | null;
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
