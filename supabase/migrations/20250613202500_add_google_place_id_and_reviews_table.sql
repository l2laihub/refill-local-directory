-- Add 'google_place_id' column to 'stores' table for linking and duplicate checking
ALTER TABLE public.stores ADD COLUMN google_place_id TEXT;

-- Add an index for faster lookups on the new column
CREATE INDEX idx_stores_google_place_id ON public.stores(google_place_id);

-- Optional: Add a UNIQUE constraint. Consider implications for existing rows that will have NULL.
-- For now, this is commented out. It can be added later if data cleanup ensures uniqueness.
-- ALTER TABLE public.stores ADD CONSTRAINT unique_google_place_id UNIQUE (google_place_id);

-- Create the 'store_reviews' table to hold review data from Outscraper
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

-- Add indexes for faster querying on the new reviews table
CREATE INDEX idx_store_reviews_store_id ON store_reviews(store_id);
CREATE INDEX idx_store_reviews_review_datetime_utc ON store_reviews(review_datetime_utc DESC);