/*
  # Create demo data for testing

  1. Demo Data
    - Create demo mosque
    - Create demo admin and household users
    - Create sample household
    - Create sample payments

  Note: This is for demonstration purposes only
*/

-- Insert demo mosque (only if it doesn't exist)
DO $$
DECLARE
  demo_mosque_id uuid;
  demo_admin_id uuid := '00000000-0000-0000-0000-000000000001';
  demo_household_id uuid := '00000000-0000-0000-0000-000000000002';
  demo_super_admin_id uuid := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- Insert demo profiles if they don't exist
  INSERT INTO profiles (id, email, role, full_name, phone)
  VALUES 
    (demo_admin_id, 'admin@demo.com', 'mosque_admin', 'Demo mosque Admin', '+1234567890'),
    (demo_household_id, 'household@demo.com', 'household', 'Demo Household User', '+1234567891'),
    (demo_super_admin_id, 'super@demo.com', 'super_admin', 'Demo Super Admin', '+1234567892')
  ON CONFLICT (id) DO NOTHING;

  -- Insert demo mosque
  INSERT INTO mosques (id, name, address, admin_id, annual_amount)
  VALUES (gen_random_uuid(), 'Demo mosque', '123 Demo Street, Demo City', demo_admin_id, 12000)
  ON CONFLICT DO NOTHING
  RETURNING id INTO demo_mosque_id;

  -- Get mosque id if it already exists
  IF demo_mosque_id IS NULL THEN
    SELECT id INTO demo_mosque_id FROM mosques WHERE admin_id = demo_admin_id LIMIT 1;
  END IF;

  -- Insert demo household
  INSERT INTO households (house_number, head_of_house, members_count, male_count, female_count, contact_number, user_id, mosque_id, annual_amount)
  VALUES ('101', 'Demo Head of House', 4, 2, 2, '+1234567891', demo_household_id, demo_mosque_id, 12000)
  ON CONFLICT (user_id) DO NOTHING;

END $$;