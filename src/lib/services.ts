import { supabase } from './supabase';
import type { City, Store, WaitlistEntry, CityRequest, StoreUpdateSuggestion, GooglePlaceSearchResultItem } from './types';

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
  },

  // Add a new store update suggestion
  async addStoreUpdateSuggestion(suggestionData: {
    store_id: string;
    user_id: string;
    suggested_changes: Record<string, any>; // JSONB
    reason?: string | null;
  }): Promise<{ id: string } | null> { // Returns the ID of the new suggestion or null
    const { data, error } = await supabase
      .from('store_update_suggestions')
      .insert([
        {
          store_id: suggestionData.store_id,
          user_id: suggestionData.user_id,
          suggested_changes: suggestionData.suggested_changes,
          reason: suggestionData.reason,
          status: 'pending', // Default status
        },
      ])
      .select('id') // Select only the ID of the newly created row
      .single(); // Expect a single row back

    if (error) {
      console.error('Error adding store update suggestion:', error);
      throw error; // Re-throw the error to be caught by the form
    }
    return data;
  },

  // Get all pending store update suggestions with user and store details
  async getPendingStoreUpdateSuggestions(): Promise<StoreUpdateSuggestion[]> {
    const { data, error } = await supabase
      .from('store_update_suggestions')
      .select(`
        *,
        stores (name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching store update suggestions:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // TODO: Implement a robust admin-level way to fetch user display names/emails from auth.users.
    // For now, we'll just use the user_id for attribution if available.
    // This might involve creating a SECURITY DEFINER function in PostgreSQL and calling it via RPC.
    return data.map(suggestion => {
      const typedSuggestion = suggestion as any; // Helper for cleaner access to joined data
      let userDisplayName = 'Anonymous';
      if (typedSuggestion.user_id) {
        // Using a truncated user_id as a temporary display name.
        userDisplayName = `User ID: ${String(typedSuggestion.user_id).substring(0, 8)}...`;
      }
      
      return {
        ...typedSuggestion,
        store_name: typedSuggestion.stores?.name || 'Unknown Store',
        user_display_name: userDisplayName,
        // Clean up joined objects if they are not part of StoreUpdateSuggestion type
        stores: undefined,
      };
    }) as StoreUpdateSuggestion[];
  },

  // Approve a store update suggestion
  async approveStoreUpdateSuggestion(suggestionId: string, adminUserId: string): Promise<boolean> {
    const { error } = await supabase
      .from('store_update_suggestions')
      .update({
        status: 'approved', // Or 'applied' if changes are made automatically
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', suggestionId);

    if (error) {
      console.error(`Error approving store update suggestion ${suggestionId}:`, error);
      return false;
    }
    return true;
  },

  // Reject a store update suggestion
  async rejectStoreUpdateSuggestion(suggestionId: string, adminUserId: string): Promise<boolean> {
    const { error } = await supabase
      .from('store_update_suggestions')
      .update({
        status: 'rejected',
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', suggestionId);

    if (error) {
      console.error(`Error rejecting store update suggestion ${suggestionId}:`, error);
      return false;
    }
    return true;
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

// TODO: IMPORTANT SECURITY NOTE:
// Calling Google Places API directly from the client-side exposes your API key.
// For production, this key MUST be heavily restricted (e.g., to specific HTTP referrers)
// OR these API calls should be proxied through a backend (e.g., a Supabase Edge Function)
// where the API key is kept secret.
// UPDATE: Now using Supabase Edge Function as a proxy.
export const googlePlacesService = {
  async searchStoresOnGooglePlaces(
    query: string,
  ): Promise<GooglePlaceSearchResultItem[]> {
    try {
      // Ensure supabase client is available. It's imported at the top of services.ts
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
        'google-places-proxy', // Name of your Edge Function
        {
          body: { query }, // Pass the query in the body
        }
      );

      if (functionError) {
        console.error('Error invoking Supabase Edge Function google-places-proxy:', functionError);
        let detailedError = functionError.message;
        // Attempt to parse more specific error from functionError.context if available
        // Supabase error context structure might vary, adjust as needed.
        if (functionError.context && typeof functionError.context.error === 'string') {
            detailedError = functionError.context.error;
        } else if (functionError.context && typeof functionError.context.details === 'string') {
            detailedError = `Google API Error (from proxy): ${functionError.context.details}`;
        } else if (functionError.context && functionError.context.message) {
            detailedError = functionError.context.message;
        }
        throw new Error(`Search via proxy failed: ${detailedError}`);
      }
      
      // The Edge Function should return the direct JSON response from Google Places API
      // or an error structure if it failed internally.
      const googlePlacesData = functionResponse;

      // Check if the functionResponse itself indicates an error passed from the Edge Function
      if (googlePlacesData && googlePlacesData.error) {
        console.error('Error reported by google-places-proxy Edge Function:', googlePlacesData.error, googlePlacesData.details || '');
        throw new Error(`Search proxy error: ${googlePlacesData.error} ${googlePlacesData.details || ''}`);
      }

      if (!googlePlacesData || (googlePlacesData.status !== 'OK' && googlePlacesData.status !== 'ZERO_RESULTS')) {
        console.error(
          `Google Places API (via proxy) returned status ${googlePlacesData?.status || 'unknown'}: ${googlePlacesData?.error_message || 'No error message provided by proxy.'}`
        );
        throw new Error(`Google Places API Error (via proxy): ${googlePlacesData?.error_message || googlePlacesData?.status || 'Unknown error from proxy'}`);
      }

      if (googlePlacesData.status === 'ZERO_RESULTS' || !googlePlacesData.results || googlePlacesData.results.length === 0) {
        return [];
      }

      // Map Google's response to our GooglePlaceSearchResultItem interface
      return googlePlacesData.results.map((item: any): GooglePlaceSearchResultItem => ({
        place_id: item.place_id,
        name: item.name,
        formatted_address: item.formatted_address,
        geometry: item.geometry?.location
          ? { location: { lat: item.geometry.location.lat, lng: item.geometry.location.lng } }
          : undefined,
        types: item.types,
        business_status: item.business_status,
        photos: item.photos?.map((photo: any) => ({
          photo_reference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
          html_attributions: photo.html_attributions,
        })) || [],
        website: item.website,
        international_phone_number: item.international_phone_number,
        opening_hours: item.opening_hours
          ? {
              open_now: item.opening_hours.open_now,
              periods: item.opening_hours.periods?.map((period: any) => ({
                open: { day: period.open?.day, time: period.open?.time },
                close: period.close ? { day: period.close?.day, time: period.close?.time } : undefined,
              })),
              weekday_text: item.opening_hours.weekday_text,
            }
          : undefined,
        rating: item.rating,
        user_ratings_total: item.user_ratings_total,
      }));
    } catch (error) {
      console.error('Error calling google-places-proxy Edge Function or processing its response:', error);
      if (error instanceof Error) {
        throw error; // Re-throw the original error if it's already an Error instance
      }
      throw new Error('An unexpected error occurred during the search via proxy.');
    }
  },
};

// Helper function to detect if a string is a valid UUID
export function isUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
