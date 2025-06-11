# Phase 2 Implementation - Testing Guide

This document outlines test cases for the features implemented in Phase 2 of the RefillLocal project.

**Prerequisites:**
1.  The application is running locally (e.g., `npm run dev`).
2.  The local Supabase instance is running and has been reset with all migrations (`supabase db reset`).
3.  For admin-specific tests, ensure you have a user with `app_metadata.user_role` set to `admin`.
4.  Open your browser's developer console to monitor network requests and log messages.

---

## 1. User Authentication & Accounts

### 1.1. User Signup
*   **Objective:** Verify new users can sign up successfully.
*   **Test Case 1.1.1: Signup without Referral Code**
    1.  Navigate to the Signup page (`/signup`).
    2.  Enter a unique email and a valid password.
    3.  Leave the "Referral Code" field blank.
    4.  Click the "Sign Up" button.
    *   **Expected Result:**
        *   User is created successfully in Supabase `auth.users` table.
        *   User is redirected (e.g., to homepage or profile page, depending on app flow).
        *   A new entry is created in `public.user_referral_codes` for this new user with a generated referral code.
        *   No entry is created in the `public.referrals` table.
*   **Test Case 1.1.2: Signup with Valid Referral Code**
    1.  Ensure there's an existing user with a known referral code (User A).
    2.  Navigate to the Signup page (`/signup`) in an incognito window or after logging out.
    3.  Enter a new unique email and a valid password for a new user (User B).
    4.  Enter User A's referral code in the "Referral Code" field.
    5.  Click the "Sign Up" button.
    *   **Expected Result:**
        *   User B is created successfully.
        *   User B is redirected.
        *   A new entry is created in `public.user_referral_codes` for User B.
        *   A new entry is created in `public.referrals` table linking User A (referring_user_id) to User B (referred_user_id), with User A's referral code.
*   **Test Case 1.1.3: Signup with Invalid/Non-existent Referral Code**
    1.  Navigate to the Signup page.
    2.  Enter a new unique email and password.
    3.  Enter a clearly invalid or non-existent referral code.
    4.  Click "Sign Up".
    *   **Expected Result:**
        *   User is created successfully.
        *   A new entry is created in `public.user_referral_codes` for the new user.
        *   No entry is created in `public.referrals`.
        *   A warning might be logged by the `process_signup_referral` stored procedure (check Supabase logs or browser console if client handles this) about the code not being found, but signup should still succeed.
*   **Test Case 1.1.4: Signup with Own Referral Code (Attempt)**
    1.  This scenario is hard to test directly via UI as a user wouldn't know their code before signing up. The `process_signup_referral` stored procedure has a check: `IF v_referring_user_id = p_referred_user_id THEN RAISE WARNING 'User cannot refer themselves.';`. This is more of a database integrity check.
    *   **Expected Result (DB Level):** If somehow this scenario was forced, the referral should not be recorded.
*   **Test Case 1.1.5: Signup with an existing email**
    1.  Attempt to sign up with an email address that already exists.
    *   **Expected Result:** Signup fails, and an appropriate error message is displayed to the user.

### 1.2. User Login
*   **Objective:** Verify existing users can log in.
*   **Test Case 1.2.1: Login with Valid Credentials**
    1.  Navigate to the Login page (`/login`).
    2.  Enter the email and password of an existing user.
    3.  Click "Login".
    *   **Expected Result:**
        *   User is logged in successfully.
        *   User is redirected (e.g., to homepage or profile).
        *   Navigation bar updates to show authenticated user options (e.g., Profile, Logout).
*   **Test Case 1.2.2: Login with Invalid Password**
    1.  Navigate to the Login page.
    2.  Enter a valid email but an incorrect password.
    3.  Click "Login".
    *   **Expected Result:** Login fails, and an appropriate error message is displayed.
*   **Test Case 1.2.3: Login with Non-existent Email**
    1.  Navigate to the Login page.
    2.  Enter an email address that is not registered.
    3.  Click "Login".
    *   **Expected Result:** Login fails, and an appropriate error message is displayed.

### 1.3. User Logout
*   **Objective:** Verify users can log out.
*   **Test Case 1.3.1: Logout**
    1.  Log in as any user.
    2.  Click the "Logout" button/link.
    *   **Expected Result:**
        *   User is logged out.
        *   User is redirected (e.g., to homepage or login page).
        *   Navigation bar updates to show non-authenticated user options (e.g., Login, Signup).

### 1.4. User Profile Page
*   **Objective:** Verify basic access to the user profile page.
*   **Test Case 1.4.1: Access Profile Page when Logged In**
    1.  Log in as any user.
    2.  Navigate to the Profile page (`/profile`).
    *   **Expected Result:** User can view their profile page (content may be basic for now).
*   **Test Case 1.4.2: Access Profile Page when Logged Out**
    1.  Ensure you are logged out.
    2.  Attempt to navigate directly to the Profile page (`/profile`).
    *   **Expected Result:** User is redirected to the Login page (due to `ProtectedRoute`).

---

## 2. Store Submission & Community Contributions

### 2.1. Add a Store
*   **Objective:** Verify users (anonymous and authenticated) can submit new stores.
*   **Test Case 2.1.1: Anonymous User Submits a Store**
    1.  Ensure you are logged out.
    2.  Navigate to the "Add Store" page (`/add-store`).
    3.  Fill in all required store details. For "City", select/enter a city that exists in your `cities` table and provide its UUID if the form requires it directly, or ensure the form handles city selection appropriately.
    4.  Submit the form.
    *   **Expected Result:**
        *   Store is submitted successfully.
        *   A new entry is created in the `stores` table with `is_verified = FALSE` and `added_by_user_id = NULL`.
        *   User sees a success message or redirection.
*   **Test Case 2.1.2: Authenticated User Submits a Store**
    1.  Log in as a non-admin user.
    2.  Navigate to the "Add Store" page.
    3.  Fill in all required store details.
    4.  Submit the form.
    *   **Expected Result:**
        *   Store is submitted successfully.
        *   A new entry is created in the `stores` table with `is_verified = FALSE` and `added_by_user_id` set to the logged-in user's ID.
        *   User sees a success message or redirection.
*   **Test Case 2.1.3: Submit Store with Missing Required Fields**
    1.  Navigate to the "Add Store" page.
    2.  Attempt to submit the form without filling in one or more required fields.
    *   **Expected Result:** Form submission fails, and appropriate validation messages are displayed for the missing fields.

---

## 3. Store Moderation (Admin)

*   **Prerequisite:** Log in as an Admin user.

### 3.1. Access Admin Moderation Page
*   **Objective:** Verify admin can access the store moderation page.
*   **Test Case 3.1.1: Admin Access**
    1.  As Admin, navigate to the Admin Dashboard (`/admin`).
    2.  Click the link/button to go to "Moderate Stores" (e.g., `/admin/moderate-stores`).
    *   **Expected Result:** Admin can view the moderation page, which should list unverified stores.

### 3.2. Approve a Store
*   **Objective:** Verify admin can approve a submitted store.
*   **Test Case 3.2.1: Approve a Pending Store**
    1.  Ensure there is at least one unverified store in the `stores` table (`is_verified = FALSE`).
    2.  As Admin, on the moderation page, find an unverified store.
    3.  Click the "Approve" button for that store.
    *   **Expected Result:**
        *   The `approve_submitted_store` stored procedure is called.
        *   The store's `is_verified` status in the `stores` table is updated to `TRUE`.
        *   The store's `updated_at` field is updated.
        *   The UI updates to reflect the change (e.g., store removed from pending list or status updated).

### 3.3. Reject a Store
*   **Objective:** Verify admin can reject (delete) a submitted store.
*   **Test Case 3.3.1: Reject a Pending Store**
    1.  Ensure there is at least one unverified store.
    2.  As Admin, on the moderation page, find an unverified store.
    3.  Click the "Reject" (or "Delete") button for that store.
    *   **Expected Result:**
        *   The `reject_submitted_store` stored procedure is called.
        *   The store record is deleted from the `stores` table.
        *   The UI updates to remove the store from the list.

---

## 4. Referral Program (Integrated Tests)

*   **Note:** Parts of this are covered in Signup (1.1.1, 1.1.2, 1.1.3). This section focuses on verifying the underlying mechanics.

### 4.1. Referral Code Generation
*   **Objective:** Verify new users automatically get a referral code.
*   **Test Case 4.1.1: Check `user_referral_codes` table after new signup**
    1.  Perform a new user signup (Test Case 1.1.1).
    2.  Using a SQL tool or Supabase Studio, inspect the `public.user_referral_codes` table.
    *   **Expected Result:** A new row exists for the newly signed-up user, containing their `user_id` and a unique `referral_code`.

### 4.2. Referral Tracking
*   **Objective:** Verify successful referrals are tracked.
*   **Test Case 4.2.1: Check `referrals` table after signup with valid code**
    1.  Perform a new user signup using a valid referral code (Test Case 1.1.2). Let User A be the referrer and User B be the new user.
    2.  Inspect the `public.referrals` table.
    *   **Expected Result:** A new row exists with `referring_user_id` = User A's ID, `referred_user_id` = User B's ID, and `referral_code_used` = User A's referral code.

---

## 5. PWA Features

### 5.1. Web App Manifest
*   **Objective:** Verify the web app manifest is correctly configured and served.
*   **Test Case 5.1.1: Inspect Manifest**
    1.  Open the application in a supported browser (e.g., Chrome, Edge).
    2.  Open Developer Tools.
    3.  Go to the "Application" tab, then "Manifest" (or "App Manifest") section.
    *   **Expected Result:**
        *   The manifest details (name, short_name, icons, start_url, display, theme_color, background_color) are displayed and match the configuration in `vite.config.ts` and any `public/manifest.json` (though `vite-plugin-pwa` often generates it).
        *   The browser shows an "Add to Home Screen" or "Install" button/prompt if PWA criteria are met. (Note: PWA icons like `pwa-192x192.png` must exist in `public/` for this to work reliably).

### 5.2. Service Worker
*   **Objective:** Verify the service worker is registered and active.
*   **Test Case 5.2.1: Inspect Service Worker**
    1.  Open Developer Tools.
    2.  Go to the "Application" tab, then "Service Workers" section.
    *   **Expected Result:**
        *   A service worker should be listed as activated and running for the application's scope.
        *   The source should point to the service worker file (e.g., `sw.js`).
*   **Test Case 5.2.2: Basic Offline Check (if caching strategy is in place)**
    1.  Load the application.
    2.  In Developer Tools (Network tab), simulate offline mode.
    3.  Try to refresh the page or navigate to a previously visited page.
    *   **Expected Result:** The page should load from the cache if basic caching is configured by the service worker. (Note: The default `vite-plugin-pwa` config might provide some level of this).

---

## 6. Role-Based Access Control (RBAC)

### 6.1. Admin Area Access
*   **Objective:** Verify only admins can access admin areas.
*   **Test Case 6.1.1: Non-Admin Tries to Access Admin Dashboard**
    1.  Log in as a regular (non-admin) user.
    2.  Attempt to navigate directly to `/admin` or `/admin/moderate-stores`.
    *   **Expected Result:** User is redirected (e.g., to homepage or a "Not Authorized" page) due to `ProtectedRoute`.
*   **Test Case 6.1.2: Anonymous User Tries to Access Admin Dashboard**
    1.  Ensure you are logged out.
    2.  Attempt to navigate directly to `/admin`.
    *   **Expected Result:** User is redirected to the Login page.

### 6.2. Admin Actions
*   **Objective:** Verify only admins can perform admin actions (covered by moderation tests 3.2, 3.3).
*   **Test Case 6.2.1: Non-Admin Tries to Approve/Reject (API Level)**
    1.  Log in as a non-admin user.
    2.  Using browser dev tools or a tool like Postman, attempt to directly call the Supabase RPCs for `approve_submitted_store` or `reject_submitted_store` with a valid store ID.
    *   **Expected Result:** The RPC call should fail with an error message like "User does not have admin privileges..." because the stored procedures check `auth.jwt() -> 'app_metadata' ->> 'user_role'`.

---

This guide should cover the main functionalities. Feel free to expand on it with more specific edge cases as you test!