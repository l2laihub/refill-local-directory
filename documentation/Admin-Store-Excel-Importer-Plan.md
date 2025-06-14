# Admin Store Excel Importer - Implementation Plan

This document outlines the tasks for implementing the Admin Store Importer tool, which allows administrators to import store and review data from `.xlsx` files provided by Outscraper.

## Pre-requisites & Schema Changes

1.  **Add `google_place_id` to `stores` Table**
    *   [ ] **Task 1.1:** Create a new database migration.
        *   SQL: `ALTER TABLE public.stores ADD COLUMN google_place_id TEXT;`
    *   [ ] **Task 1.2:** Add an index for faster lookups.
        *   SQL: `CREATE INDEX idx_stores_google_place_id ON public.stores(google_place_id);`
    *   [ ] **Task 1.3:** (Optional) Consider adding a UNIQUE constraint if `google_place_id` should be unique per store.
        *   SQL: `ALTER TABLE public.stores ADD CONSTRAINT unique_google_place_id UNIQUE (google_place_id);` (Note: handle nulls if not all existing stores will have this).
    *   [ ] **Task 1.4:** Update `Store` TypeScript interface in `src/lib/types.ts` to include `google_place_id?: string;`.

2.  **Create `store_reviews` Table**
    *   [ ] **Task 2.1:** Create a new database migration for the `store_reviews` table.
        *   Schema:
            ```sql
            CREATE TABLE store_reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
                review_id_external VARCHAR(255) UNIQUE, -- Outscraper's review_id or Google's review ID
                place_id VARCHAR(255), -- Store's Google Place ID, for reference from review file
                author_name VARCHAR(255),
                author_id_external VARCHAR(255), -- Outscraper's author_id
                review_text TEXT,
                rating SMALLINT, -- Individual review rating (e.g., 1-5)
                review_datetime_utc TIMESTAMPTZ,
                owner_answer TEXT,
                owner_answer_datetime_utc TIMESTAMPTZ,
                likes_count INTEGER DEFAULT 0,
                review_source VARCHAR(50) DEFAULT 'outscraper_google',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX idx_store_reviews_store_id ON store_reviews(store_id);
            CREATE INDEX idx_store_reviews_review_datetime_utc ON store_reviews(review_datetime_utc DESC);
            ```
    *   [ ] **Task 2.2:** Create `StoreReview` TypeScript interface in `src/lib/types.ts`.

## Phase 1: Store Data Import from Excel

Focus: Importing core store information from the main Outscraper `.xlsx` file.

### I. Backend Development (Supabase Edge Function or Dedicated Service)

1.  **Setup Excel Parsing Library**
    *   [ ] **Task 1.1:** Choose and integrate an Excel parsing library compatible with the chosen backend environment (e.g., Deno: `https://deno.land/x/xlsx`, Node.js: `xlsx`).

2.  **Core Field Mapping Definition**
    *   [ ] **Task 2.1:** Finalize the mapping from Outscraper store Excel columns to `stores` table fields.
        *   `name` -> `stores.name`
        *   `site` -> `stores.website_url`
        *   `full_address` -> `stores.address`
        *   `latitude` -> `stores.latitude`
        *   `longitude` -> `stores.longitude`
        *   `phone` (or `phone_1`) -> `stores.phone`
        *   `email_1` -> `stores.email`
        *   `description` (or `about`) -> `stores.description`
        *   `photo` -> `stores.image_url`
        *   `place_id` (or `google_id`) -> `stores.google_place_id`
        *   `working_hours` -> `stores.hours_of_operation` (requires parsing logic)

3.  **`working_hours` Parsing Logic**
    *   [ ] **Task 3.1:** Implement a robust function to parse the Outscraper `working_hours` JSON string:
        `{"Monday": "4:30-8PM", "Tuesday": "Closed", ...}`
        into the RefillLocal `StoreHoursOfOperation` JSON structure:
        `{ monday: { open: "16:30", close: "20:00", closed: false }, tuesday: { open: "", close: "", closed: true } ... }`
        *   Handle various time formats (AM/PM, H, HH, H:MM).
        *   Handle "Closed".

4.  **Develop `process_store_excel` Edge Function / Service Endpoint**
    *   [ ] **Task 4.1:** Create an endpoint that accepts the `.xlsx` file upload and a `targetCityId`.
    *   [ ] **Task 4.2:** Implement file reading and parsing using the chosen library.
    *   [ ] **Task 4.3:** Validate Excel headers against the expected core field list.
    *   [ ] **Task 4.4:** For each row in the Excel:
        *   Extract data based on the defined mapping.
        *   Apply the `working_hours` parsing logic.
        *   Validate data types (e.g., lat/lng are numbers, email format).
        *   Perform duplicate check against `stores.google_place_id` in the database.
        *   If no `google_place_id` is available from Excel, attempt duplicate check based on `name` and `address` (less reliable).
        *   Prepare a list of `Store` objects ready for import, and a list of rows with errors/warnings or identified as duplicates.
    *   [ ] **Task 4.5:** Return a summary to the frontend:
        *   Total rows processed.
        *   Number of stores valid for import.
        *   Number of identified duplicates (with links to existing stores if possible).
        *   Number of rows with errors (with specific error messages per row).
        *   (Optional) The validated data itself for final review before committing to import.

5.  **Develop `import_validated_stores` Edge Function / Service Endpoint**
    *   [ ] **Task 5.1:** Create an endpoint that accepts the list of validated `Store` objects (or a reference to the processed data from Task 4).
    *   [ ] **Task 5.2:** For each valid, non-duplicate store:
        *   Set `city_id` from admin input.
        *   Set `added_by_user_id` (current admin).
        *   Set `is_verified` (default or from admin input).
        *   Insert the new record into the `stores` table.
    *   [ ] **Task 5.3:** Return a final import summary (number successfully imported, any failures during insert).

### II. Frontend Development (`AdminImportStoresPage.tsx`)

1.  **Redesign UI for File Upload**
    *   [ ] **Task 1.1:** Remove Google Places API search elements.
    *   [ ] **Task 1.2:** Add a file input component for `.xlsx` files.
    *   [ ] **Task 1.3:** Keep/refine the "Target City" dropdown.
    *   [ ] **Task 1.4:** Add an "Upload & Validate Stores File" button.

2.  **Implement File Upload and Validation Call**
    *   [ ] **Task 2.1:** On button click, upload the selected file and `targetCityId` to the `process_store_excel` backend endpoint.
    *   [ ] **Task 2.2:** Display loading/processing state.
    *   [ ] **Task 2.3:** Display the validation summary from the backend:
        *   Counts of valid, duplicate, error rows.
        *   Detailed error messages for problematic rows.
        *   (Optional) A preview of data deemed valid for import.

3.  **Implement Final Import Step**
    *   [ ] **Task 3.1:** If validation is successful and admin confirms, provide an "Import X Valid Stores" button.
    *   [ ] **Task 3.2:** On button click, call the `import_validated_stores` backend endpoint.
    *   [ ] **Task 3.3:** Display final import progress and summary.

## Phase 2: Review Data Import from Excel

Focus: Importing individual review data from the Outscraper reviews `.xlsx` file and linking to existing stores.

### I. Backend Development

1.  **Core Field Mapping for Reviews**
    *   [ ] **Task 1.1:** Define mapping from Outscraper review Excel columns to `store_reviews` table fields.
        *   `place_id` (or `google_id`) -> Used to find `store_id`
        *   `review_id` -> `store_reviews.review_id_external`
        *   `author_title` -> `store_reviews.author_name`
        *   `author_id` -> `store_reviews.author_id_external`
        *   `review_text` -> `store_reviews.review_text`
        *   `review_rating` -> `store_reviews.rating`
        *   `review_datetime_utc` -> `store_reviews.review_datetime_utc`
        *   `owner_answer` -> `store_reviews.owner_answer`
        *   `owner_answer_timestamp_datetime_utc` -> `store_reviews.owner_answer_datetime_utc`
        *   `review_likes` -> `store_reviews.likes_count`

2.  **Develop `process_review_excel` Edge Function / Service Endpoint**
    *   [ ] **Task 2.1:** Create an endpoint that accepts the reviews `.xlsx` file upload.
    *   [ ] **Task 2.2:** Parse the Excel file.
    *   [ ] **Task 2.3:** Validate headers.
    *   [ ] **Task 2.4:** For each row:
        *   Extract review data.
        *   Validate data types (rating is number, datetime format).
        *   Use `place_id` from the review row to look up the internal `store_id` (UUID) from your `stores` table (specifically from the `google_place_id` column). If no matching store, flag as an error/orphan.
        *   Check for duplicate reviews in `store_reviews` using `review_id_external`.
        *   Prepare a list of `StoreReview` objects for import, and a list of rows with errors.
    *   [ ] **Task 2.5:** Return validation summary.

3.  **Develop `import_validated_reviews` Edge Function / Service Endpoint**
    *   [ ] **Task 3.1:** Create an endpoint that accepts validated `StoreReview` objects.
    *   [ ] **Task 3.2:** For each valid, non-duplicate review, insert into `store_reviews` table, linking to the correct `store_id`.
    *   [ ] **Task 3.3:** Return final import summary.

### II. Frontend Development (`AdminImportStoresPage.tsx` or new page)

1.  **UI for Reviews File Upload**
    *   [ ] **Task 1.1:** Add a separate file input for the reviews `.xlsx` file.
    *   [ ] **Task 1.2:** Add "Upload & Validate Reviews File" button.
    *   Logic to ensure stores are imported first or that reviews can be matched to existing stores.

2.  **Implement Reviews Validation and Import Flow**
    *   [ ] **Task 2.1:** Similar to store import, call backend for validation, display summary.
    *   [ ] **Task 2.2:** Call backend for final import, display summary.

## III. Testing & Refinement (For each Phase)

1.  **Backend Testing**
    *   [ ] Unit tests for parsing logic (especially `working_hours`).
    *   [ ] Integration tests for file processing and database import endpoints.
    *   [ ] Test duplicate handling and error reporting.
2.  **Frontend Testing**
    *   [ ] Test file upload UI.
    *   [ ] Test display of validation and import summaries.
    *   [ ] Test error states.
3.  **End-to-End Testing**
    *   [ ] Test with sample valid and invalid `.xlsx` files.
    *   [ ] Test with files containing duplicates.
4.  **Documentation**
    *   [ ] Create admin guide on how to use the importer and the expected Excel format.