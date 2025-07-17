/*
  # Create purchase invoices tables

  1. New Tables
    - `purchase_invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `invoice_date` (timestamptz)
      - `supplier_id` (uuid, references uae_suppliers)
      - `supplier_trn` (text)
      - `subtotal` (numeric)
      - `vat_amount` (numeric)
      - `total_amount` (numeric)
      - `input_vat_recoverable` (numeric)
      - `reverse_charge_applicable` (boolean)
      - `status` (text)
      - `payment_due_date` (timestamptz)
      - `notes` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `purchase_invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, references purchase_invoices)
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

CREATE TABLE IF NOT EXISTS purchase_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  invoice_date timestamptz NOT NULL,
  supplier_id uuid NOT NULL REFERENCES uae_suppliers(id),
  supplier_trn text NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  input_vat_recoverable numeric NOT NULL DEFAULT 0,
  reverse_charge_applicable boolean NOT NULL DEFAULT false,
  status text NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'PAID')),
  payment_due_date timestamptz NOT NULL,
  notes text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 5,
  vat_treatment text NOT NULL CHECK (vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT', 'REVERSE_CHARGE')),
  amount numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for purchase_invoices
CREATE POLICY "Users can read purchase_invoices"
  ON purchase_invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert purchase_invoices"
  ON purchase_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update purchase_invoices"
  ON purchase_invoices
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete purchase_invoices"
  ON purchase_invoices
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for purchase_invoice_items
CREATE POLICY "Users can read purchase_invoice_items"
  ON purchase_invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert purchase_invoice_items"
  ON purchase_invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update purchase_invoice_items"
  ON purchase_invoice_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete purchase_invoice_items"
  ON purchase_invoice_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_purchase_invoices_updated_at
BEFORE UPDATE ON purchase_invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_invoice_items_updated_at
BEFORE UPDATE ON purchase_invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();