# Admin Store Importer - Implementation Plan (Phase 1)

This document outlines the tasks and sub-tasks for implementing Phase 1 of the Admin Store Importer tool. The goal of this phase is to allow administrators to search for stores using the Google Places API, review the results, manually augment the data with RefillLocal-specific information, and import them into the database.

## I. Setup & Configuration

1.  **Google Cloud Platform (GCP) & Places API Setup**
    *   [ ] **Task 1.1:** Ensure a Google Cloud Platform (GCP) project is available or create a new one.
    *   [ ] **Task 1.2:** Enable the "Places API" within the GCP project.
        *   Sub-task: Verify associated billing account.
    *   [ ] **Task 1.3:** Generate or identify an existing API Key for the Places API.
        *   Sub-task: Configure API key restrictions (e.g., HTTP referrers, API restrictions) for security if possible.
    *   [ ] **Task 1.4:** Review Google Places API documentation.
        *   Sub-task: Identify specific endpoints to be used (e.g., "Text Search", "Place Details").
        *   Sub-task: Understand request parameters, response structures, and usage quotas/limits.
        *   Sub-task: Familiarize with current pricing models.

2.  **API Key Management**
    *   [ ] **Task 2.1:** Securely store the Google Places API Key.
        *   Sub-task: Add `GOOGLE_PLACES_API_KEY` as an environment variable in the Supabase backend environment (or equivalent for your backend setup).
        *   Sub-task: Ensure the `.env.local` (or equivalent) is in `.gitignore`.

## II. Backend Development

(Primarily in `src/lib/services.ts` or a new dedicated admin service file, e.g., `src/lib/adminServices.ts`)

1.  **Define TypeScript Interfaces for API Data**
    *   [ ] **Task 1.1:** Create `GooglePlaceSearchResultItem` interface.
        *   Fields: `place_id`, `name`, `formatted_address`, `geometry` (for lat/lng), `types`, `business_status`, `photos` (photo_reference), `website`, `international_phone_number`, `opening_hours`.
    *   [ ] **Task 1.2:** Create `GooglePlaceDetailsResult` interface (if "Place Details" endpoint is used extensively).
        *   Fields: More comprehensive details than search result.
    *   [ ] **Task 1.3:** Create `StoreImportCandidate` interface (combining Google data with fields for manual input).

2.  **Develop Service Functions for Google Places API Interaction**
    *   [ ] **Task 2.1:** Implement `searchStoresOnGooglePlaces(query: string, cityContext?: string): Promise<GooglePlaceSearchResultItem[]>`
        *   Inputs: User's search query (e.g., "refill stores in London"), optional city context to refine search.
        *   Functionality:
            *   Construct request to Google Places API "Text Search" endpoint using `GOOGLE_PLACES_API_KEY`.
            *   Handle API response (success and errors).
            *   Parse and map relevant fields from the API response to `GooglePlaceSearchResultItem[]`.
            *   Return the list of search results.
    *   [ ] **Task 2.2:** (Optional, if needed) Implement `getStoreDetailsFromGooglePlaces(placeId: string): Promise<GooglePlaceDetailsResult>`
        *   Inputs: A `place_id` from a search result.
        *   Functionality:
            *   Construct request to Google Places API "Place Details" endpoint.
            *   Handle API response.
            *   Parse and map relevant fields.
            *   Return detailed store information.

3.  **Develop Service Function for Importing Stores**
    *   [ ] **Task 3.1:** Implement `importStoreToDatabase(storeData: StoreInputType, adminUserId: string): Promise<{ success: boolean, error?: any, storeId?: string }>`
        *   Inputs: `storeData` (a complete store object matching our `stores` table schema, including manually entered fields), `adminUserId`.
        *   Functionality:
            *   Validate `storeData`.
            *   Perform a final duplicate check (e.g., based on name and address, or a unique Google Place ID if reliable).
            *   Insert the new store record into the `public.stores` table in Supabase.
            *   Set `added_by_user_id` to `adminUserId`.
            *   Set `is_verified` based on admin input (default to `false` or `true` as decided).
            *   Return success status and new `storeId`, or an error.

## III. Frontend Development (Admin Interface)

(Likely a new page, e.g., `src/pages/AdminImportStoresPage.tsx` and supporting components)

1.  **Create New Admin Page & Routing**
    *   [ ] **Task 1.1:** Define a new route for `/admin/import-stores` (or similar).
    *   [ ] **Task 1.2:** Create the main page component `AdminImportStoresPage.tsx`.
    *   [ ] **Task 1.3:** Add navigation link to this page in the admin dashboard/sidebar.

2.  **Build Search Interface**
    *   [ ] **Task 2.1:** Create UI elements:
        *   Text input for search query (e.g., "Store name / type in City").
        *   Dropdown to select target `city_id` from existing cities in the database (this helps associate the store correctly).
        *   "Search Stores" button.
    *   [ ] **Task 2.2:** Implement state management for search inputs.
    *   [ ] **Task 2.3:** On button click, call the backend service `searchStoresOnGooglePlaces` and handle loading/error states.

3.  **Develop Results Display & Review/Edit Form Component**
    *   [ ] **Task 3.1:** Create a component to display each search result (e.g., `StoreImportCandidateCard.tsx`).
        *   Display key information fetched from Google (name, address, phone, website link).
        *   "Review & Prepare for Import" button/action.
    *   [ ] **Task 3.2:** Implement a "Review & Edit" modal or inline form.
        *   Pre-fill form fields with data from Google Places API.
        *   Provide a direct link to the store's actual website (from Google data) for admin reference.
        *   **Manual Input Fields:**
            *   `description` (textarea)
            *   `email` (text input)
            *   `what_to_bring` (textarea)
            *   `products` (e.g., a tag input or multi-select for common products, or a simple comma-separated text input)
            *   `image_url` (text input, admin can copy-paste if found)
        *   Confirm/select `city_id` (should be pre-filled from search step but editable).
        *   Checkbox for `is_verified`.
    *   [ ] **Task 3.3:** Implement **Duplicate Checking Display Logic**:
        *   Before allowing import, query existing `stores` table for potential duplicates based on:
            *   Google Place ID (if available and reliable for uniqueness).
            *   Store name and address.
        *   Clearly indicate to the admin if a potential duplicate is found, providing a link to the existing store.
    *   [ ] **Task 3.4:** "Save & Add to Import Queue" or "Import This Store" button within the review form.
        *   This button will trigger the call to the backend `importStoreToDatabase` service function.
        *   Handle success (e.g., clear the item, show a success message) and error states.

4.  **(Optional) Batch Import Functionality**
    *   [ ] **Task 4.1:** Consider if admins should be able to review multiple stores and then import them in a batch. If so, design UI for selecting multiple reviewed stores and a "Import Selected X Stores" button.

## IV. Testing & Refinement

1.  **Backend Testing**
    *   [ ] **Task 1.1:** Unit/integration tests for Google Places API service functions (mocking API calls).
    *   [ ] **Task 1.2:** Test store import logic, including duplicate handling and data validation.
2.  **Frontend Testing**
    *   [ ] **Task 2.1:** Test search functionality with various queries.
    *   [ ] **Task 2.2:** Test the review and manual data entry form.
    *   [ ] **Task 2.3:** Test the import process and feedback to the admin.
3.  **End-to-End Testing**
    *   [ ] **Task 3.1:** Perform full workflow tests: search -> review -> manual edit -> import.
4.  **Documentation Review**
    *   [ ] **Task 4.1:** Update any relevant admin user guides.