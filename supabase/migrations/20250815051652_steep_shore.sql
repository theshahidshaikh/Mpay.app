/*
  # Create households table

  1. New Tables
    - `households`
      - `id` (uuid, primary key)
      - `house_number` (text, not null)
      - `head_of_house` (text, not null)
      - `members_count` (integer, not null)
      - `male_count` (integer, default 0)
      - `female_count` (integer, default 0)
      - `contact_number` (text, not null)
      - `user_id` (uuid, references profiles)
      - `mosque_id` (uuid, references mosques)
      - `annual_amount` (numeric, custom amount for this household)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `households` table
    - Add policies for household users to read/update their own data
    - Add policies for mosque admins to manage households in their mosque
*/

CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_number text NOT NULL,
  head_of_house text NOT NULL,
  members_count integer NOT NULL DEFAULT 1,
  male_count integer DEFAULT 0,
  female_count integer DEFAULT 0,
  contact_number text NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mosque_id uuid NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  annual_amount numeric DEFAULT 12000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id), -- One household per user
  UNIQUE(mosque_id, house_number) -- Unique house number per mosque
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Household users can read and update their own household
CREATE POLICY "Household users can read own household"
  ON households
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Household users can update own household"
  ON households
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Mosque admins can read households in their mosque
CREATE POLICY "Mosque admins can read mosque households"
  ON households
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mosques
      WHERE id = mosque_id AND admin_id = auth.uid()
    )
  );

-- Super admins can read all households
CREATE POLICY "Super admins can read all households"
  ON households
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Allow household creation during registration
CREATE POLICY "Allow household creation"
  ON households
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());