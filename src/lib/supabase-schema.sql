-- Create tables for RefillLocal

-- Cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT
);

-- Create an index on the slug for faster lookups
CREATE INDEX IF NOT EXISTS cities_slug_idx ON cities (slug);

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  hours_of_operation JSONB NOT NULL,
  what_to_bring TEXT NOT NULL,
  products TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  added_by_user_id UUID
);

-- Create an index on city_id for faster lookups
CREATE INDEX IF NOT EXISTS stores_city_id_idx ON stores (city_id);

-- Waitlist table
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referred_by TEXT
);

-- City requests table
CREATE TABLE city_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_name TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint on city_name, state, country
CREATE UNIQUE INDEX IF NOT EXISTS city_requests_unique_idx ON city_requests (city_name, state, country);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at column on stores
CREATE TRIGGER update_stores_modified
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- RLS (Row Level Security) Policies
-- These will need to be adjusted based on actual authentication setup

-- Allow anonymous read access to cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access to cities" ON cities
  FOR SELECT USING (TRUE);

-- Allow anonymous read access to stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access to stores" ON stores
  FOR SELECT USING (TRUE);

-- Allow anonymous insert access to waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert access to waitlist" ON waitlist
  FOR INSERT WITH CHECK (TRUE);

-- Allow anonymous insert access to city_requests
ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert access to city_requests" ON city_requests
  FOR INSERT WITH CHECK (TRUE);

-- Allow anonymous insert access to stores (for community submissions)
CREATE POLICY "Allow anonymous insert access to stores" ON stores
  FOR INSERT TO anon -- Explicitly for the anonymous role
  WITH CHECK (is_verified = FALSE AND added_by_user_id IS NULL);
