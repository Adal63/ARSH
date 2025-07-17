/*
  # Create UAE customers table

  1. New Tables
    - `uae_customers`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `trn` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `contact_website` (text)
      - `billing_street` (text)
      - `billing_city` (text)
      - `billing_emirate` (text)
      - `billing_country` (text)
      - `billing_po_box` (text)
      - `shipping_street` (text)
      - `shipping_city` (text)
      - `shipping_emirate` (text)
      - `shipping_country` (text)
      - `shipping_po_box` (text)
      - `customer_type` (text)
      - `default_vat_treatment` (text)
      - `account_group` (text)
      - `payment_terms` (text)
      - `credit_limit` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `uae_customers` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS uae_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  trn text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  contact_website text,
  billing_street text NOT NULL,
  billing_city text NOT NULL,
  billing_emirate text NOT NULL,
  billing_country text NOT NULL,
  billing_po_box text,
  shipping_street text,
  shipping_city text,
  shipping_emirate text,
  shipping_country text,
  shipping_po_box text,
  customer_type text NOT NULL CHECK (customer_type IN ('VAT_REGISTERED', 'NON_VAT')),
  default_vat_treatment text NOT NULL CHECK (default_vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
  account_group text NOT NULL CHECK (account_group IN ('DOMESTIC', 'GCC', 'EXPORT')),
  payment_terms text NOT NULL,
  credit_limit numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE uae_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read uae_customers"
  ON uae_customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert uae_customers"
  ON uae_customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update uae_customers"
  ON uae_customers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete uae_customers"
  ON uae_customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_uae_customers_updated_at
BEFORE UPDATE ON uae_customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();