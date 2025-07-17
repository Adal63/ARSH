/*
  # Create accounts table

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `name` (text)
      - `type` (text)
      - `category` (text)
      - `balance` (numeric)
      - `parent_id` (uuid, references accounts)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `accounts` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  category text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  parent_id uuid REFERENCES accounts(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();