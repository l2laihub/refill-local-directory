# Admin Store Excel Importer - Testing Guide

This document provides instructions for testing the Admin Excel Importer functionality for importing store data from `.xlsx` files.

## I. Prerequisites

### 1. Sample Data File
You will need a `.xlsx` file for stores. You can create this based on the Outscraper format.

**Sample Store File (`stores.xlsx`)**
Create a spreadsheet with the following columns. `name`, `full_address`, `latitude`, `longitude`, and `place_id` are required.

| name | site | full_address | latitude | longitude | phone | email_1 | description | photo | place_id | working_hours |
|---|---|---|---|---|---|---|---|---|---|---|
| Test Store 1 | https://test.com | 123 Main St, Anytown, USA | 40.7128 | -74.0060 | 555-1234 | contact@test.com | A great store. | https://via.placeholder.com/150 | ChIJN1t_tDeuEmsRUsoyG83frY4 | `{"Monday": "9AM-5PM", "Tuesday": "Closed"}` |
| Test Store 2 (Duplicate) | https://test2.com | 456 Oak Ave, Anytown, USA | 34.0522 | -118.2437 | 555-5678 | | | https://via.placeholder.com/150 | ChIJN1t_tDeuEmsRUsoyG83frY4 | `{"Monday": "10:00-18:00"}` |
| Test Store 3 (Error) | | 789 Pine Ln, Anytown, USA | not-a-lat | -122.4194 | | | A store with bad data. | | ChIJyT4_tDeuEmsRUsoyG83frZ9 | |

---

## II. Testing The Store Import

### Test Case 1: Successful Import
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

### Test Case 2: File Validation Errors
1.  Create a `stores.xlsx` file that is missing a required column (e.g., delete the `name` column).
2.  Follow steps 1-4 from Test Case 1.
3.  **Verification:** An error message should appear indicating that a required column is missing. The "Import" button should not be available.

---
This guide covers the primary success and failure paths for the store importer.