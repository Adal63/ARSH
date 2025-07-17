/*
  # Create UAE suppliers table

  1. New Tables
    - `uae_suppliers`
      - `id` (uuid, primary key)
      - `supplier_name` (text)
      - `trn` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `contact_website` (text)
      - `address_street` (text)
      - `address_city` (text)
      - `address_emirate` (text)
      - `address_country` (text)
      - `address_po_box` (text)
      - `supplier_type` (text)
      - `default_vat_treatment` (text)
      - `payment_terms` (text)
      - `bank_name` (text)
      - `bank_account_number` (text)
      - `bank_iban` (text)
      - `bank_swift_code` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `uae_suppliers` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS uae_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name text NOT NULL,
  trn text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  contact_website text,
  address_street text NOT NULL,
  address_city text NOT NULL,
  address_emirate text NOT NULL,
  address_country text NOT NULL,
  address_po_box text,
  supplier_type text NOT NULL CHECK (supplier_type IN ('LOCAL', 'GCC', 'OVERSEAS')),
  default_vat_treatment text NOT NULL CHECK (default_vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT', 'REVERSE_CHARGE')),
  payment_terms text NOT NULL,
  bank_name text,
  bank_account_number text,
  bank_iban text,
  bank_swift_code text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE uae_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read uae_suppliers"
  ON uae_suppliers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert uae_suppliers"
  ON uae_suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update uae_suppliers"
  ON uae_suppliers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete uae_suppliers"
  ON uae_suppliers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_uae_suppliers_updated_at
BEFORE UPDATE ON uae_suppliers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();