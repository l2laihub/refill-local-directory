-- Function to assign a referral code to a new user (e.g., called by a trigger on auth.users insert)
-- Adding SET search_path = public to ensure it can find generate_referral_code and public.user_referral_codes
CREATE OR REPLACE FUNCTION assign_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_referral_codes (user_id, referral_code)
    VALUES (NEW.id, generate_referral_code());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public; -- Explicitly set search_path