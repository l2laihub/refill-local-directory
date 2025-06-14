CREATE OR REPLACE FUNCTION add_store_as_admin(
    p_name TEXT,
    p_description TEXT,
    p_address TEXT,
    p_city_id UUID,
    p_latitude REAL,
    p_longitude REAL,
    p_hours_of_operation JSONB,
    p_what_to_bring TEXT,
    p_products TEXT[],
    p_website_url TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_image_url TEXT,
    p_submitter_user_id UUID,
    p_google_place_id TEXT
)
RETURNS stores AS $$
DECLARE
    new_store stores;
BEGIN
    INSERT INTO public.stores (
        name, description, address, city_id, latitude, longitude,
        hours_of_operation, what_to_bring, products, website_url,
        phone, email, image_url, added_by_user_id, google_place_id, is_verified
    )
    VALUES (
        p_name, p_description, p_address, p_city_id, p_latitude, p_longitude,
        p_hours_of_operation, p_what_to_bring, p_products, p_website_url,
        p_phone, p_email, p_image_url, p_submitter_user_id, p_google_place_id, TRUE
    )
    RETURNING * INTO new_store;
    RETURN new_store;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_store_as_admin(
    TEXT, TEXT, TEXT, UUID, REAL, REAL, JSONB, TEXT, TEXT[], TEXT, TEXT, TEXT, TEXT, UUID, TEXT
) TO authenticated;

CREATE OR REPLACE FUNCTION update_store_by_admin(p_store_id UUID, p_store_data JSONB)
RETURNS stores
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  updated_store stores;
BEGIN
  UPDATE public.stores
  SET
    name = p_store_data->>'name',
    description = p_store_data->>'description',
    website_url = p_store_data->>'website_url',
    phone = p_store_data->>'phone',
    email = p_store_data->>'email',
    address = p_store_data->>'address',
    city_id = (p_store_data->>'city_id')::UUID,
    latitude = (p_store_data->>'latitude')::REAL,
    longitude = (p_store_data->>'longitude')::REAL,
    hours_of_operation = (p_store_data->'hours_of_operation'),
    what_to_bring = p_store_data->>'what_to_bring',
    products = (SELECT array_agg(value) FROM jsonb_array_elements_text(p_store_data->'products')),
    is_verified = (p_store_data->>'is_verified')::BOOLEAN,
    image_url = p_store_data->>'image_url',
    google_place_id = p_store_data->>'google_place_id',
    updated_at = NOW()
  WHERE id = p_store_id
  RETURNING * INTO updated_store;

  RETURN updated_store;
END;
$$;

GRANT EXECUTE ON FUNCTION update_store_by_admin(UUID, JSONB) TO authenticated;