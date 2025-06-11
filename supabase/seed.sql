-- Seed data for RefillLocal cities

-- Insert cities from the CITIES constant in our codebase
INSERT INTO cities (name, slug, state, country, is_active, image_url)
VALUES
  ('Portland', 'portland', 'OR', 'USA', TRUE, NULL),
  ('Austin', 'austin', 'TX', 'USA', TRUE, NULL),
  ('San Francisco', 'san-francisco', 'CA', 'USA', TRUE, NULL),
  ('New York', 'new-york', 'NY', 'USA', TRUE, NULL),
  ('Seattle', 'seattle', 'WA', 'USA', TRUE, NULL),
  ('Denver', 'denver', 'CO', 'USA', TRUE, NULL),
  ('Boulder', 'boulder', 'CO', 'USA', TRUE, NULL),
  ('Asheville', 'asheville', 'NC', 'USA', TRUE, NULL),
  ('Burlington', 'burlington', 'VT', 'USA', TRUE, NULL),
  ('Minneapolis', 'minneapolis', 'MN', 'USA', TRUE, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Sample store data for Seattle
INSERT INTO stores (
  name, 
  description, 
  website_url, 
  phone, 
  email, 
  address, 
  city_id, 
  latitude, 
  longitude, 
  hours_of_operation, 
  what_to_bring, 
  products, 
  is_verified,
  image_url
)
VALUES (
  'EcoRefill Seattle',
  'A zero-waste store offering a wide range of refillable household and personal care products.',
  'https://example.com/ecorefill',
  '(206) 555-1234',
  'info@ecorefillseattle.example.com',
  '123 Pine Street, Seattle, WA 98101',
  (SELECT id FROM cities WHERE slug = 'seattle'),
  47.608013,
  -122.335167,
  '{"monday":{"open":"09:00","close":"18:00","closed":false},"tuesday":{"open":"09:00","close":"18:00","closed":false},"wednesday":{"open":"09:00","close":"18:00","closed":false},"thursday":{"open":"09:00","close":"18:00","closed":false},"friday":{"open":"09:00","close":"18:00","closed":false},"saturday":{"open":"10:00","close":"17:00","closed":false},"sunday":{"open":"12:00","close":"16:00","closed":false}}',
  'Bring your own clean containers for liquids, cloth bags for dry goods, and jars for bulk items.',
  ARRAY['Laundry Detergent', 'Dish Soap', 'Shampoo', 'Conditioner', 'Body Wash', 'Lotion', 'All-Purpose Cleaner'],
  TRUE,
  NULL
)
ON CONFLICT DO NOTHING;
