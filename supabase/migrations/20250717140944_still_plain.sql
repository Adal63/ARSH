/*
  # Create UAE E-Invoices table

  1. New Tables
    - `uae_einvoices`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, references invoices)
      - `invoice_type_code` (text)
      - `invoice_type_sub_code` (text)
      - `document_currency_code` (text)
      - `tax_currency_code` (text)
      - `supplier_tax_number` (text)
      - `customer_tax_number` (text)
      - `payment_means_code` (text)
      - `tax_category_code` (text)
      - `tax_percent` (numeric)
      - `invoice_note` (text)
      - `order_reference` (text)
      - `contract_reference` (text)
      - `additional_document_reference` (text)
      - `qr_code` (text)
      - `digital_signature` (text)
      - `previous_invoice_hash` (text)
      - `invoice_hash` (text)
      - `uuid` (text)
      - `submission_date_time` (timestamptz)
      - `clearance_status` (text)
      - `clearance_date_time` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `uae_einvoices` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS uae_einvoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  invoice_type_code text NOT NULL,
  invoice_type_sub_code text NOT NULL,
  document_currency_code text NOT NULL DEFAULT 'AED',
  tax_currency_code text NOT NULL DEFAULT 'AED',
  supplier_tax_number text NOT NULL,
  customer_tax_number text,
  payment_means_code text NOT NULL,
  tax_category_code text NOT NULL,
  tax_percent numeric NOT NULL,
  invoice_note text,
  order_reference text,
  contract_reference text,
  additional_document_reference text,
  qr_code text NOT NULL,
  digital_signature text,
  previous_invoice_hash text,
  invoice_hash text NOT NULL,
  uuid text NOT NULL,
  submission_date_time timestamptz NOT NULL,
  clearance_status text NOT NULL CHECK (clearance_status IN ('CLEARED', 'NOT_CLEARED', 'REPORTED')),
  clearance_date_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE uae_einvoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read uae_einvoices"
  ON uae_einvoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert uae_einvoices"
  ON uae_einvoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update uae_einvoices"
  ON uae_einvoices
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete uae_einvoices"
  ON uae_einvoices
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_uae_einvoices_updated_at
BEFORE UPDATE ON uae_einvoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();