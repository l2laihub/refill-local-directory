-- Stored Procedures for Store Management (SECURITY DEFINER)

-- Procedure to add a new store submission
CREATE OR REPLACE FUNCTION add_store_submission(
    p_name TEXT,
    p_description TEXT,
    p_address TEXT,
    p_city_id UUID,
    p_latitude DECIMAL(10, 8) DEFAULT 0,
    p_longitude DECIMAL(11, 8) DEFAULT 0,
    p_hours_of_operation TEXT DEFAULT NULL, -- Expects a string, ideally valid JSON for JSONB column
    p_what_to_bring TEXT DEFAULT NULL,
    p_products TEXT[] DEFAULT NULL,
    p_website_url TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_submitter_user_id UUID DEFAULT NULL
)
RETURNS stores -- Returns the created store record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Explicitly set search_path
AS $$
DECLARE
    new_store stores;
BEGIN
    INSERT INTO stores (
        name, description, address, city_id, latitude, longitude,
        hours_of_operation, what_to_bring, products, website_url,
        phone, email, image_url, added_by_user_id, is_verified
    )
    VALUES (
        p_name, p_description, p_address, p_city_id, p_latitude, p_longitude,
        to_jsonb(p_hours_of_operation), -- Attempt to convert; will fail if not valid JSON.
        p_what_to_bring, p_products, p_website_url,
        p_phone, p_email, p_image_url, p_submitter_user_id, FALSE
    )
    RETURNING * INTO new_store;
    RETURN new_store;
END;
$$;

-- Procedure to approve a store
CREATE OR REPLACE FUNCTION approve_submitted_store(p_store_id UUID)
RETURNS stores
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_store stores;
BEGIN
    IF NOT (auth.jwt() -> 'app_metadata' ->> 'user_role' = 'admin') THEN
        RAISE EXCEPTION 'User does not have admin privileges to approve stores.';
    END IF;

    UPDATE stores
    SET is_verified = TRUE, updated_at = NOW()
    WHERE id = p_store_id AND is_verified = FALSE -- Ensure it's an unverified store
    RETURNING * INTO updated_store;

    RETURN updated_store;
END;
$$;

-- Procedure to reject (delete) a store
CREATE OR REPLACE FUNCTION reject_submitted_store(p_store_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT (auth.jwt() -> 'app_metadata' ->> 'user_role' = 'admin') THEN
        RAISE EXCEPTION 'User does not have admin privileges to reject stores.';
    END IF;

    DELETE FROM stores WHERE id = p_store_id;
END;
$$;

-- Remove direct admin RLS policies for UPDATE and DELETE on 'stores' table,
-- as these actions are now handled by the stored procedures above.
DROP POLICY IF EXISTS "Allow admin update access to stores" ON stores;
DROP POLICY IF EXISTS "Allow admin delete access to stores" ON stores;

-- Referral System

-- Table to store referral codes and track usage
CREATE TABLE IF NOT EXISTS user_referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_referral_codes
ALTER TABLE user_referral_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own referral code.
CREATE POLICY "Users can read their own referral code" ON user_referral_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Table to track successful referrals
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referring_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Ensures a user can only be referred once
    referral_code_used TEXT NOT NULL, -- The actual code used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see referrals they made.
CREATE POLICY "Users can see referrals they made" ON referrals
  FOR SELECT USING (auth.uid() = referring_user_id);

-- Policy: Users can see if they were referred.
CREATE POLICY "Users can see if they were referred" ON referrals
  FOR SELECT USING (auth.uid() = referred_user_id);


-- Function to generate a unique referral code (example implementation)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := upper(substring(md5(random()::text) for 8)); -- Example: 8-char uppercase alphanumeric
        SELECT EXISTS (SELECT 1 FROM user_referral_codes WHERE referral_code = new_code) INTO code_exists;
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- Function to assign a referral code to a new user (e.g., called by a trigger on auth.users insert)
CREATE OR REPLACE FUNCTION assign_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_referral_codes (user_id, referral_code)
    VALUES (NEW.id, generate_referral_code());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER to write to public table

-- Trigger on new user creation in auth.users to assign a referral code
CREATE TRIGGER on_new_user_assign_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_user_referral_code();


-- Stored procedure to process a referral on signup
CREATE OR REPLACE FUNCTION process_signup_referral(
    p_referred_user_id UUID,
    p_referral_code_input TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referring_user_id UUID;
BEGIN
    IF p_referral_code_input IS NULL OR p_referral_code_input = '' THEN
        RETURN; -- No referral code provided
    END IF;

    -- Find the user who owns the referral code
    SELECT user_id INTO v_referring_user_id
    FROM user_referral_codes
    WHERE referral_code = upper(p_referral_code_input); -- Ensure case-insensitivity for input

    IF v_referring_user_id IS NULL THEN
        RAISE WARNING 'Referral code % not found.', p_referral_code_input;
        RETURN;
    END IF;

    IF v_referring_user_id = p_referred_user_id THEN
        RAISE WARNING 'User cannot refer themselves.';
        RETURN;
    END IF;

    -- Record the successful referral
    -- A UNIQUE constraint on referred_user_id in 'referrals' table handles if user was already referred.
    BEGIN
        INSERT INTO referrals (referring_user_id, referred_user_id, referral_code_used)
        VALUES (v_referring_user_id, p_referred_user_id, upper(p_referral_code_input));
    EXCEPTION WHEN unique_violation THEN
        RAISE WARNING 'User % has already been referred.', p_referred_user_id;
    END;

END;
$$;