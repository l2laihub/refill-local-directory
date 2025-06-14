# Admin Store & Review Excel Importer - Testing Guide

This document provides instructions for testing the Admin Excel Importer functionality, which allows for bulk importing of store and review data from `.xlsx` files.

## I. Prerequisites

### 1. Sample Data Files
You will need two separate `.xlsx` files: one for stores and one for reviews. You can create these based on the Outscraper format.

**Sample Store File (`stores.xlsx`)**
Create a spreadsheet with the following columns. `name`, `full_address`, `latitude`, `longitude`, and `place_id` are required.

| name | site | full_address | latitude | longitude | phone | email_1 | description | photo | place_id | working_hours |
|---|---|---|---|---|---|---|---|---|---|---|
| Test Store 1 | https://test.com | 123 Main St, Anytown, USA | 40.7128 | -74.0060 | 555-1234 | contact@test.com | A great store. | https://via.placeholder.com/150 | ChIJN1t_tDeuEmsRUsoyG83frY4 | `{"Monday": "9AM-5PM", "Tuesday": "Closed"}` |
| Test Store 2 (Duplicate) | https://test2.com | 456 Oak Ave, Anytown, USA | 34.0522 | -118.2437 | 555-5678 | | | https://via.placeholder.com/150 | ChIJN1t_tDeuEmsRUsoyG83frY4 | `{"Monday": "10:00-18:00"}` |
| Test Store 3 (Error) | | 789 Pine Ln, Anytown, USA | not-a-lat | -122.4194 | | | A store with bad data. | | ChIJyT4_tDeuEmsRUsoyG83frZ9 | |

**Sample Review File (`reviews.xlsx`)**
Create a second spreadsheet for reviews. The `place_id` values in this file **must** correspond to `google_place_id` values of stores that already exist in your database (i.e., from a previous store import). `place_id`, `review_id`, `review_rating`, and `review_datetime_utc` are required.

| place_id | review_id | author_title | review_text | review_rating | review_datetime_utc |
|---|---|---|---|---|---|
| ChIJN1t_tDeuEmsRUsoyG83frY4 | rEvIewId1 | John Doe | "Loved this place!" | 5 | 2023-10-26T10:00:00Z |
| ChIJN1t_tDeuEmsRUsoyG83frY4 | rEvIewId2 | Jane Smith | "It was okay." | 3 | 2023-10-25T15:30:00Z |
| A-Non-Existent-Place-ID | rEvIewId3 | Sam Jones | "Will not be found." | 1 | 2023-10-24T12:00:00Z |

---

## II. Testing Phase 1: Store Import

### Test Case 1.1: Successful Import
1.  Navigate to the **Admin -> Import Stores** page in your application.
2.  In **Step 1**, select a **Target City** from the dropdown menu.
3.  Click the "Drag 'n' drop or click to upload" area and select your valid `stores.xlsx` file.
4.  Click the **"Upload & Validate Stores"** button.
5.  **Verification:**
    *   A validation summary should appear under **Step 3**.
    *   The counts for "Total Rows", "Ready to Import", "Duplicates", and "Errors" should match your file's data. For the sample above, you should see 1 valid, 1 duplicate, and 1 error.
    *   The error details should be displayed correctly.
6.  Click the **"Import X Valid Stores"** button.
7.  **Verification:**
    *   An alert should appear confirming the number of stores imported.
    *   (Optional) Check the `stores` table in your Supabase dashboard to verify that "Test Store 1" was added correctly with the right `city_id`.

### Test Case 1.2: File Validation Errors
1.  Create a `stores.xlsx` file that is missing a required column (e.g., delete the `name` column).
2.  Follow steps 1-4 from Test Case 1.1.
3.  **Verification:** An error message should appear indicating that a required column is missing. The "Import" button should not be available.

---

## III. Testing Phase 2: Review Import

### Test Case 2.1: Successful Review Import
1.  Ensure you have successfully imported the stores from `stores.xlsx` first.
2.  On the **Import Stores** page, locate **Step 2: Upload Review Data File**.
3.  Upload your valid `reviews.xlsx` file.
4.  Click the **"Upload & Validate Reviews"** button.
5.  **Verification:**
    *   The validation summary should appear.
    *   For the sample file, you should see 2 valid reviews and 1 error (for the non-existent `place_id`).
6.  Click the **"Import X Valid Reviews"** button.
7.  **Verification:**
    *   An alert should appear confirming that 2 reviews were imported.
    *   (Optional) Check the `store_reviews` table in Supabase. You should see two new entries linked to the correct `store_id`.

### Test Case 2.2: Duplicate Reviews
1.  Run the import from Test Case 2.1 again with the same `reviews.xlsx` file.
2.  Follow steps 2-5 from Test Case 2.1.
3.  **Verification:**
    *   The validation summary should now show 0 "Ready to Import" and 2 "Duplicates", since those reviews already exist in the database.

---
This guide covers the primary success and failure paths for the importer. Feel free to expand on it with more complex test cases.