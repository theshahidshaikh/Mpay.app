/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `household_id` (uuid, references households)
      - `amount` (numeric, not null)
      - `payment_date` (date, not null)
      - `month` (integer, 1-12)
      - `year` (integer)
      - `payment_method` (text) - online, cash
      - `transaction_id` (text, optional)
      - `receipt_url` (text, optional)
      - `status` (text) - pending, paid, failed
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for household users to read their payments
    - Add policies for mosque admins to manage payments in their mosque
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  payment_method text NOT NULL CHECK (payment_method IN ('online', 'cash')) DEFAULT 'online',
  transaction_id text,
  receipt_url text,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(household_id, month, year) -- One payment per household per month
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Household users can read their own payments
CREATE POLICY "Household users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM households
      WHERE id = household_id AND user_id = auth.uid()
    )
  );

-- Household users can create their own payments
CREATE POLICY "Household users can create own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM households
      WHERE id = household_id AND user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Mosque admins can read and manage payments in their mosque
CREATE POLICY "Mosque admins can read mosque payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM households h
      JOIN mosques m ON h.mosque_id = m.id
      WHERE h.id = household_id AND m.admin_id = auth.uid()
    )
  );

CREATE POLICY "Mosque admins can create mosque payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM households h
      JOIN mosques m ON h.mosque_id = m.id
      WHERE h.id = household_id AND m.admin_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Super admins can read all payments
CREATE POLICY "Super admins can read all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );