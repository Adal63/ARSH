/*
  # Create invoices and invoice items tables

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `customer_id` (uuid, references customers)
      - `date` (timestamptz)
      - `due_date` (timestamptz)
      - `total` (numeric)
      - `status` (text)
      - `mj_no` (text)
      - `sales_order` (text)
      - `sales_quote` (text)
      - `description` (text)
      - `project` (text)
      - `division` (text)
      - `closed_invoice` (boolean)
      - `withholding_tax` (numeric)
      - `discount` (numeric)
      - `chasis_no` (text)
      - `vehicle_no` (text)
      - `car_model` (text)
      - `service_kms` (text)
      - `terms_conditions` (text)
      - `cost_of_sales` (numeric)
      - `approved_by` (text)
      - `created_by` (text)
      - `credit_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, references invoices)
      - `description` (text)
      - `quantity` (numeric)
      - `rate` (numeric)
      - `amount` (numeric)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id),
  date timestamptz NOT NULL,
  due_date timestamptz NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('draft', 'pending', 'paid', 'overdue')),
  mj_no text,
  sales_order text,
  sales_quote text,
  description text,
  project text,
  division text,
  closed_invoice boolean DEFAULT false,
  withholding_tax numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  chasis_no text,
  vehicle_no text,
  car_model text,
  service_kms text,
  terms_conditions text,
  cost_of_sales numeric DEFAULT 0,
  approved_by text,
  created_by text,
  credit_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for invoices
CREATE POLICY "Users can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for invoice_items
CREATE POLICY "Users can read invoice_items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice_items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice_items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete invoice_items"
  ON invoice_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
BEFORE UPDATE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();