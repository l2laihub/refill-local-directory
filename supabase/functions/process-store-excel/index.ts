import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { read, utils } from 'https://deno.land/x/xlsx/xlsx.mjs';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Store, StoreHoursOfOperation } from '../../../src/lib/types.ts';

//---------------------------------------------------------
//           WORKING HOURS PARSING LOGIC (Task 3.1)
//---------------------------------------------------------
// Type definition for the raw working hours from Outscraper
type RawDayWorkingHours = { [day: string]: string | undefined };

// Converts time strings like "9", "9:30", "9AM", "9:30PM" to "HH:mm" format.
const formatTime = (timeStr: string): string => {
    if (!timeStr) return "";

    // Normalize by removing spaces and making it uppercase
    timeStr = timeStr.replace(/\s+/g, '').toUpperCase();

    // Regular expression to capture hours, minutes, and AM/PM
    const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)?$/);
    if (!match) return ""; // Return empty if format is unexpected

    let [_, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);

    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) { // Midnight case
        hours = 0;
    }

    // Format to HH:mm
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Parses the JSON string from the 'working_hours' column.
const parseWorkingHours = (hoursJson: string): StoreHoursOfOperation | null => {
    if (!hoursJson || hoursJson.trim() === '{}') return null;

    try {
        const rawHours: RawDayWorkingHours = JSON.parse(hoursJson);
        const daysOfWeek: (keyof StoreHoursOfOperation)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        const processedHours: StoreHoursOfOperation = {
            monday: { open: "", close: "", closed: true },
            tuesday: { open: "", close: "", closed: true },
            wednesday: { open: "", close: "", closed: true },
            thursday: { open: "", close: "", closed: true },
            friday: { open: "", close: "", closed: true },
            saturday: { open: "", close: "", closed: true },
            sunday: { open: "", close: "", closed: true },
        };

        for (const day of daysOfWeek) {
            const rawDayString = rawHours[day.charAt(0).toUpperCase() + day.slice(1)];

            if (!rawDayString || rawDayString.toUpperCase() === 'CLOSED') {
                processedHours[day].closed = true;
            } else if (rawDayString.toUpperCase() === 'OPEN 24 HOURS') {
                processedHours[day] = { open: '00:00', close: '23:59', closed: false };
            }
            else {
                // Split by common separators like '-', '–', or 'to'
                const times = rawDayString.split(/[-–]|to/i);
                if (times.length === 2) {
                    const openTime = formatTime(times[0].trim());
                    const closeTime = formatTime(times[1].trim());

                    if (openTime && closeTime) {
                        processedHours[day] = { open: openTime, close: closeTime, closed: false };
                    }
                }
            }
        }
        return processedHours;
    } catch (error) {
        console.error("Failed to parse working hours JSON:", hoursJson, error);
        return null;
    }
};


//---------------------------------------------------------
//          CORE FIELD MAPPING & VALIDATION (Task 2.1 & 4.3)
//---------------------------------------------------------
const REQUIRED_HEADERS = ['name', 'full_address', 'latitude', 'longitude', 'place_id'];
const OPTIONAL_HEADERS_MAP = {
    website: ['site', 'website_url'],
    phone: ['phone', 'phone_1'],
    email: ['email_1', 'email'],
    description: ['description', 'about'],
    imageUrl: ['photo', 'image_url'],
    googlePlaceId: ['place_id', 'google_id'],
    workingHours: ['working_hours'],
};


// Function to find the actual header present in the file for a given mapped field.
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
        
        const jsonData: any[] = utils.sheet_to_json(worksheet, {
            header: 1, // Get first row as header array
            defval: '', // Default value for empty cells
        });

        const headerRow: string[] = jsonData[0] ? jsonData[0].map(String) : [];
        const lowerCaseHeaders = headerRow.map(h => h.toLowerCase());

        // **Task 4.3: Validate headers**
        const missingHeaders = REQUIRED_HEADERS.filter(h => !lowerCaseHeaders.includes(h));
        if (missingHeaders.length > 0) {
            return new Response(JSON.stringify({ error: `Missing required Excel columns: ${missingHeaders.join(', ')}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
        
        const dataRows = jsonData.slice(1);
        
        interface RowError {
            row: { [key: string]: any };
            error: string;
        }

        interface DuplicateRow {
            row: { [key: string]: any };
            existingStore: { id: any; name: any; };
        }

        const processedResult: {
            validForImport: Partial<Store>[];
            duplicates: DuplicateRow[];
            errors: RowError[];
        } = {
            validForImport: [],
            duplicates: [],
            errors: []
        };
        
        // **Task 4.4: Process each row**
        for (const row of dataRows) {
            const rowData: { [key: string]: any } = {};
            headerRow.forEach((header, i) => {
                rowData[header] = row[i];
            });

            // Extract data using mapping
            const googlePlaceId = rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.googlePlaceId) || 'place_id'];

            // Duplicate check against the database
            const { data: existingStore, error: dbError } = await supabase
                .from('stores')
                .select('id, name')
                .eq('google_place_id', googlePlaceId)
                .maybeSingle();

            if (dbError) {
                processedResult.errors.push({ row: rowData, error: `Database query failed: ${dbError.message}` });
                continue;
            }

            if (existingStore) {
                processedResult.duplicates.push({ row: rowData, existingStore });
                continue;
            }

            // TODO: Add more validation logic here (data types, etc.)

            // Prepare the store object
            const store: Partial<Store> = {
                name: rowData.name,
                address: rowData.full_address,
                latitude: parseFloat(rowData.latitude),
                longitude: parseFloat(rowData.longitude),
                google_place_id: googlePlaceId,
                website_url: rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.website) || ''],
                phone: rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.phone) || ''],
                email: rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.email) || ''],
                description: rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.description) || ''],
                image_url: rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.imageUrl) || ''],
                hours_of_operation: parseWorkingHours(rowData[findHeader(lowerCaseHeaders, OPTIONAL_HEADERS_MAP.workingHours) || '']) ?? "{}",
            };

            processedResult.validForImport.push(store);
        }

        // **Task 4.5: Return summary**
        return new Response(JSON.stringify({
            totalRowsProcessed: dataRows.length,
            validForImportCount: processedResult.validForImport.length,
            duplicateCount: processedResult.duplicates.length,
            errorCount: processedResult.errors.length,
            // Optionally return the data for frontend preview
            // validForImport: processedResult.validForImport, 
            // duplicates: processedResult.duplicates,
            // errors: processedResult.errors,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error('Critical error in process-store-excel function:', e);
        const error = e instanceof Error ? e : new Error(String(e));
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});