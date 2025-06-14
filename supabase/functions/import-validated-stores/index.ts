// supabase/functions/import-validated-stores/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import type { Store } from '../../../src/lib/types.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Supabase environment variables are not set.");
        }
        
        // It's crucial to use the service_role key for operations that require bypassing RLS,
        // like an admin importing stores. Ensure this key is set in your function's environment variables.
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if(!supabaseServiceKey){
            throw new Error("Supabase service role key not set.");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);


        const { storesToImport, targetCityId } = await req.json();

        if (!Array.isArray(storesToImport) || storesToImport.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid stores provided for import.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        if (!targetCityId) {
            return new Response(JSON.stringify({ error: 'Target city ID is required.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        
        // When a function is called from a client, it doesn't automatically know who the user is.
        // We need to create a new client with the user's auth token to verify them.
        const authHeader = req.headers.get('Authorization')!;
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: getUserError } = await authClient.auth.getUser();

        if (getUserError) {
            console.error('Error fetching user:', getUserError);
        }

        if (!user) {
            console.error('Authentication failed: No user object was returned. This may be due to an invalid JWT or a misconfigured JWT secret in your local Supabase setup.');
            return new Response(JSON.stringify({
                error: 'Authentication failed. Could not verify user.',
                details: getUserError?.message || 'No user object returned from auth provider. Check function logs.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        const storesWithMetadata = storesToImport.map((store: Partial<Store>) => ({
            ...store,
            city_id: targetCityId,
            added_by_user_id: user.id,
            is_verified: true, // Assuming admin-imported stores are automatically verified
            what_to_bring: 'Please contact the store for information on what to bring.',
            products: [], // Default to an empty array for products
        }));
        
        const { data, error } = await supabase
            .from('stores')
            .insert(storesWithMetadata)
            .select();

        if (error) {
            console.error('Error during batch insert:', error);
            throw new Error(`Failed to import stores: ${error.message}`);
        }

        return new Response(JSON.stringify({
            message: 'Import successful!',
            importedCount: data.length,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error('Critical error in import-validated-stores function:', e);
        const error = e instanceof Error ? e : new Error(String(e));
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});