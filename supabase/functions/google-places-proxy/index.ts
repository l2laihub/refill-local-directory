// supabase/functions/google-places-proxy/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts' // We'll create this shared CORS helper

// console.log('google-places-proxy function initializing');

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    // console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    // console.log('Received query:', query);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const apiKey = Deno.env.get('VITE_GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      // console.error('GOOGLE_PLACES_API_KEY is not set in Edge Function environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured on server' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
    // console.log('Using API Key (first 5 chars):', apiKey.substring(0,5));


    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    const fieldsToRequest = [
      'place_id',
      'name',
      'formatted_address',
      'geometry', // for lat, lng
      'business_status',
      'photos',
      'website',
      'international_phone_number',
      'opening_hours',
      'rating',
      'user_ratings_total',
      'types' // useful for filtering/understanding the place type
    ];
    const searchParams = new URLSearchParams({
      query: query as string,
      key: apiKey,
      fields: fieldsToRequest.join(','), // Explicitly request needed fields
      // language: 'en', // Optional: to ensure consistent language
      // type: 'store' // Optional: be more specific if needed
    })

    const url = `${baseUrl}?${searchParams.toString()}`
    // console.log('Requesting URL:', url);

    const googleResponse = await fetch(url)
    // console.log('Google API response status:', googleResponse.status);


    if (!googleResponse.ok) {
      const errorBody = await googleResponse.text()
      // console.error('Google Places API request failed:', errorBody);
      return new Response(
        JSON.stringify({
          error: `Google Places API request failed: ${googleResponse.status}`,
          details: errorBody,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: googleResponse.status,
        }
      )
    }

    const data = await googleResponse.json()
    // console.log('Google API response data status:', data.status);


    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // console.error('Error in Edge Function:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})