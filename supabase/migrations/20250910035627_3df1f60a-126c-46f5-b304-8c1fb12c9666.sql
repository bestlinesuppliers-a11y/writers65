-- Update user role to writer
UPDATE profiles 
SET role = 'writer'::app_role,
    updated_at = now()
WHERE email = 'omosherick15@gmail.com';

-- Create writer profile for the user
INSERT INTO writer_profiles (
  user_id,
  bio,
  skills,
  categories,
  hourly_rate,
  per_page_rate,
  availability,
  verification_status,
  rating,
  completed_orders
) VALUES (
  'cdbe9a43-32e7-4a24-be06-d1a14d700cce',
  'Experienced writer specializing in academic and creative content.',
  ARRAY['Academic Writing', 'Research', 'Content Creation', 'Editing'],
  ARRAY['Essays', 'Research Papers', 'Business Writing', 'Creative Writing'],
  25.00,
  15.00,
  true,
  'pending',
  0.00,
  0
);