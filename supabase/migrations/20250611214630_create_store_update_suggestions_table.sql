-- Create store_update_suggestions table
CREATE TABLE IF NOT EXISTS public.store_update_suggestions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who made the suggestion
    suggested_changes JSONB NOT NULL, -- e.g., {"name": "New Store Name", "phone": "123-456-7890"}
    reason TEXT, -- Optional reason for the suggestion
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'applied'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL -- Admin who reviewed
);

-- Add comments to the table and columns
COMMENT ON TABLE public.store_update_suggestions IS 'Stores suggestions for updates to store information.';
COMMENT ON COLUMN public.store_update_suggestions.store_id IS 'The store being suggested for an update.';
COMMENT ON COLUMN public.store_update_suggestions.user_id IS 'The user who submitted the suggestion. Nullable if anonymous suggestions are allowed in future.';
COMMENT ON COLUMN public.store_update_suggestions.suggested_changes IS 'JSONB object containing field-value pairs of suggested updates.';
COMMENT ON COLUMN public.store_update_suggestions.reason IS 'Optional user-provided reason for the suggestion.';
COMMENT ON COLUMN public.store_update_suggestions.status IS 'Current status of the suggestion (pending, approved, rejected, applied).';
COMMENT ON COLUMN public.store_update_suggestions.reviewed_by IS 'The admin user who reviewed this suggestion.';

-- Enable RLS
ALTER TABLE public.store_update_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies

-- Authenticated users can insert suggestions for themselves
CREATE POLICY "Allow authenticated users to insert their own suggestions"
ON public.store_update_suggestions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own suggestions
CREATE POLICY "Allow users to view their own suggestions"
ON public.store_update_suggestions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all suggestions
CREATE POLICY "Allow admins to view all suggestions"
ON public.store_update_suggestions
FOR SELECT
TO authenticated -- Or a specific admin role if you have one
USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

-- Admins can update suggestions (e.g., change status, add reviewed_by)
CREATE POLICY "Allow admins to update suggestions"
ON public.store_update_suggestions
FOR UPDATE
TO authenticated -- Or a specific admin role
USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

-- Note: Deletion of suggestions might be restricted or handled by admins.
-- For now, no specific DELETE policy is added for users. Admins would use their bypass RLS privileges if needed.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_store_update_suggestions_store_id ON public.store_update_suggestions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_update_suggestions_user_id ON public.store_update_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_update_suggestions_status ON public.store_update_suggestions(status);