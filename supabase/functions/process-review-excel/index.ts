// supabase/functions/process-review-excel/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { read, utils } from 'https://esm.sh/xlsx@0.18.5'
import { corsHeaders } from '../_shared/cors.ts'
import type { StoreReview } from '../../../src/lib/types.ts'

//---------------------------------------------------------
//          CORE FIELD MAPPING & VALIDATION
//---------------------------------------------------------
const REQUIRED_REVIEW_HEADERS = ['place_id', 'review_id', 'review_rating', 'review_datetime_utc'];
const REVIEW_HEADERS_MAP = {
    place_id: ['place_id', 'google_id'],
    review_id_external: ['review_id'],
    author_name: ['author_title'],
    author_id_external: ['author_id'],
    review_text: ['review_text'],
    rating: ['review_rating'],
    review_datetime_utc: ['review_datetime_utc'],
    owner_answer: ['owner_answer'],
    owner_answer_datetime_utc: ['owner_answer_timestamp_datetime_utc'],
    likes_count: ['review_likes'],
};

const findHeader = (headers: string[], mapping: string[]): string | undefined => {
    return mapping.find(h => headers.includes(h.toLowerCase()));
};

//---------------------------------------------------------
//                MAIN EDGE FUNCTION
//---------------------------------------------------------
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
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'Missing or invalid file' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData: any[] = utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const headerRow: string[] = jsonData[0] ? jsonData[0].map(String) : [];
        const lowerCaseHeaders = headerRow.map(h => h.toLowerCase());

        const missingHeaders = REQUIRED_REVIEW_HEADERS.filter(h => !lowerCaseHeaders.includes(h));
        if (missingHeaders.length > 0) {
            return new Response(JSON.stringify({ error: `Missing required Excel columns: ${missingHeaders.join(', ')}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        
        const dataRows = jsonData.slice(1);
        const validForImport: Partial<StoreReview>[] = [];
        const duplicates: any[] = [];
        const errors: any[] = [];
        
        const allPlaceIds = [...new Set(dataRows.map(row => row[headerRow.indexOf('place_id')]).filter(Boolean))];
        const allReviewIds = [...new Set(dataRows.map(row => row[headerRow.indexOf('review_id')]).filter(Boolean))];

        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('id, google_place_id')
            .in('google_place_id', allPlaceIds);

        if (storesError) throw storesError;

        const { data: existingReviews, error: reviewsError } = await supabase
            .from('store_reviews')
            .select('review_id_external')
            .in('review_id_external', allReviewIds);
        
        if (reviewsError) throw reviewsError;

        const storeMap = new Map(stores.map(s => [s.google_place_id, s.id]));
        const existingReviewIds = new Set(existingReviews.map(r => r.review_id_external));

        for (const row of dataRows) {
            const rowData: { [key: string]: any } = {};
            headerRow.forEach((header, i) => { rowData[header] = row[i]; });

            const placeId = rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.place_id) || 'place_id'];
            const reviewId = rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.review_id_external) || 'review_id'];

            if (!storeMap.has(placeId)) {
                errors.push({ row: rowData, error: `Store with Google Place ID '${placeId}' not found in the database.` });
                continue;
            }

            if (existingReviewIds.has(reviewId)) {
                duplicates.push({ row: rowData, error: `Review with ID '${reviewId}' already exists.` });
                continue;
            }

            const review: Partial<StoreReview> = {
                store_id: storeMap.get(placeId),
                place_id: placeId,
                review_id_external: reviewId,
                author_name: rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.author_name) || ''],
                review_text: rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.review_text) || ''],
                rating: parseInt(rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.rating) || '0'], 10),
                review_datetime_utc: rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.review_datetime_utc) || ''],
                owner_answer: rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.owner_answer) || ''],
                owner_answer_datetime_utc: rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.owner_answer_datetime_utc) || ''] || null,
                likes_count: parseInt(rowData[findHeader(lowerCaseHeaders, REVIEW_HEADERS_MAP.likes_count) || '0'], 10) || 0,
            };

            validForImport.push(review);
        }

        return new Response(JSON.stringify({
            totalRowsProcessed: dataRows.length,
            validForImportCount: validForImport.length,
            duplicateCount: duplicates.length,
            errorCount: errors.length,
            validForImport,
            errors
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error('Critical error in process-review-excel function:', e);
        const error = e instanceof Error ? e : new Error(String(e));
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});