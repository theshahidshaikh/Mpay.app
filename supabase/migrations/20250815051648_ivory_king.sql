/*
  # Create mosques table

  1. New Tables
    - `mosques`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `address` (text, not null)
      - `admin_id` (uuid, references profiles)
      - `annual_amount` (numeric, default collection amount)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mosques` table
    - Add policies for mosque admins to read their mosque
    - Add policy for super admins to manage all mosques
*/

CREATE TABLE IF NOT EXISTS mosques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  annual_amount numeric DEFAULT 12000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mosques ENABLE ROW LEVEL SECURITY;

-- mosque admins can read their own mosque
CREATE POLICY "mosque admins can read own mosque"
  ON mosques
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

-- Super admins can manage all mosques
CREATE POLICY "Super admins can manage mosques"
  ON mosques
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- mosque admins can update their own mosque
CREATE POLICY "mosque admins can update own mosque"
  ON mosques
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid());