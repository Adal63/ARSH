/*
  # Create receipts and payments tables

  1. New Tables
    - `receipts`
      - `id` (uuid, primary key)
      - `receipt_number` (text, unique)
      - `customer_id` (uuid, references customers)
      - `invoice_id` (uuid, references invoices)
      - `amount` (numeric)
      - `payment_method` (text)
      - `payment_reference` (text)
      - `date` (timestamptz)
      - `description` (text)
      - `status` (text)
      - `bank_account` (text)
      - `cheque_number` (text)
      - `cheque_date` (timestamptz)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payments`
      - `id` (uuid, primary key)
      - `payment_number` (text, unique)
      - `supplier_id` (uuid, references uae_suppliers)
      - `vendor_id` (text)
      - `bill_id` (text)
      - `amount` (numeric)
      - `payment_method` (text)
      - `payment_reference` (text)
      - `date` (timestamptz)
      - `description` (text)
      - `status` (text)
      - `bank_account` (text)
      - `cheque_number` (text)
      - `cheque_date` (timestamptz)
      - `approved_by` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id),
  invoice_id uuid REFERENCES invoices(id),
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE')),
  payment_reference text,
  date timestamptz NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED')),
  bank_account text,
  cheque_number text,
  cheque_date timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES uae_suppliers(id),
  vendor_id text,
  bill_id text,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE')),
  payment_reference text,
  date timestamptz NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED')),
  bank_account text,
  cheque_number text,
  cheque_date timestamptz,
  approved_by text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for receipts
CREATE POLICY "Users can read receipts"
  ON receipts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert receipts"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update receipts"
  ON receipts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete receipts"
  ON receipts
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for payments
CREATE POLICY "Users can read payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete payments"
  ON payments
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON receipts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();