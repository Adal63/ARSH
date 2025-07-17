/*
  # Create sales quotations tables

  1. New Tables
    - `sales_quotations`
      - `id` (uuid, primary key)
      - `quotation_number` (text, unique)
      - `quotation_date` (timestamptz)
      - `validity_date` (timestamptz)
      - `customer_id` (uuid, references customers)
      - `customer_trn` (text)
      - `subtotal` (numeric)
      - `vat_amount` (numeric)
      - `total_amount` (numeric)
      - `status` (text)
      - `notes` (text)
      - `terms` (text)
      - `converted_to_sales_order` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `quotation_items`
      - `id` (uuid, primary key)
      - `quotation_id` (uuid, references sales_quotations)
      - `description` (text)
      - `quantity` (numeric)
      - `rate` (numeric)
      - `discount` (numeric)
      - `vat_rate` (numeric)
      - `vat_treatment` (text)
      - `amount` (numeric)
      - `vat_amount` (numeric)
      - `total_amount` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS sales_quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text UNIQUE NOT NULL,
  quotation_date timestamptz NOT NULL,
  validity_date timestamptz NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id),
  customer_trn text NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('PENDING', 'CONVERTED', 'EXPIRED', 'CANCELLED')),
  notes text,
  terms text,
  converted_to_sales_order text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES sales_quotations(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 5,
  vat_treatment text NOT NULL CHECK (vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
  amount numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Policies for sales_quotations
CREATE POLICY "Users can read sales_quotations"
  ON sales_quotations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales_quotations"
  ON sales_quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales_quotations"
  ON sales_quotations
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete sales_quotations"
  ON sales_quotations
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for quotation_items
CREATE POLICY "Users can read quotation_items"
  ON quotation_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert quotation_items"
  ON quotation_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update quotation_items"
  ON quotation_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete quotation_items"
  ON quotation_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_sales_quotations_updated_at
BEFORE UPDATE ON sales_quotations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotation_items_updated_at
BEFORE UPDATE ON quotation_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();