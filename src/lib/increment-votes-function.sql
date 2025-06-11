-- Function to increment votes for a city request by ID
CREATE OR REPLACE FUNCTION increment_city_request_votes_by_id(city_request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE city_requests
  SET votes = votes + 1
  WHERE id = city_request_id;
END;
$$ LANGUAGE plpgsql;
