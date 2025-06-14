// supabase/functions/import-validated-reviews/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import type { StoreReview } from '../../../src/lib/types.ts'

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Supabase environment variables are not set.");
        }
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { reviewsToImport } = await req.json();

        if (!Array.isArray(reviewsToImport) || reviewsToImport.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid reviews provided for import.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        
        const { data, error } = await supabase
            .from('store_reviews')
            .insert(reviewsToImport as Partial<StoreReview>[])
            .select();

        if (error) {
            console.error('Error during batch insert:', error);
            throw new Error(`Failed to import reviews: ${error.message}`);
        }

        return new Response(JSON.stringify({
            message: 'Review import successful!',
            importedCount: data.length,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error('Critical error in import-validated-reviews function:', e);
        const error = e instanceof Error ? e : new Error(String(e));
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});