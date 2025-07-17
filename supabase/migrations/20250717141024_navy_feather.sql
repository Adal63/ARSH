/*
  # Create bank and cash book tables

  1. New Tables
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `bank_name` (text)
      - `branch_name` (text)
      - `account_number` (text)
      - `account_type` (text)
      - `ifsc_code` (text)
      - `swift_code` (text)
      - `iban` (text)
      - `opening_balance` (numeric)
      - `current_balance` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `bank_transactions`
      - `id` (uuid, primary key)
      - `bank_account_id` (uuid, references bank_accounts)
      - `transaction_date` (timestamptz)
      - `transaction_type` (text)
      - `amount` (numeric)
      - `balance` (numeric)
      - `description` (text)
      - `reference` (text)
      - `cheque_number` (text)
      - `vat_applicable` (boolean)
      - `vat_amount` (numeric)
      - `vat_treatment` (text)
      - `reconciled` (boolean)
      - `reconciled_date` (timestamptz)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cash_book_entries`
      - `id` (uuid, primary key)
      - `date` (timestamptz)
      - `voucher_number` (text)
      - `particulars` (text)
      - `debit_amount` (numeric)
      - `credit_amount` (numeric)
      - `balance` (numeric)
      - `narration` (text)
      - `cash_account` (text)
      - `vat_applicable` (boolean)
      - `vat_amount` (numeric)
      - `vat_treatment` (text)
      - `linked_transaction_id` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `inter_account_transfers`
      - `id` (uuid, primary key)
      - `transfer_number` (text)
      - `transfer_date` (timestamptz)
      - `from_account_id` (uuid)
      - `from_account_type` (text)
      - `to_account_id` (uuid)
      - `to_account_type` (text)
      - `amount` (numeric)
      - `narration` (text)
      - `status` (text)
      - `approved_by` (text)
      - `approval_date` (timestamptz)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  branch_name text NOT NULL,
  account_number text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('CURRENT', 'SAVINGS', 'FIXED_DEPOSIT')),
  ifsc_code text,
  swift_code text,
  iban text NOT NULL,
  opening_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id),
  transaction_date timestamptz NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('DEBIT', 'CREDIT')),
  amount numeric NOT NULL CHECK (amount > 0),
  balance numeric NOT NULL,
  description text NOT NULL,
  reference text NOT NULL,
  cheque_number text,
  vat_applicable boolean NOT NULL DEFAULT false,
  vat_amount numeric,
  vat_treatment text CHECK (vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
  reconciled boolean NOT NULL DEFAULT false,
  reconciled_date timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cash_book_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  voucher_number text NOT NULL,
  particulars text NOT NULL,
  debit_amount numeric NOT NULL DEFAULT 0,
  credit_amount numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL,
  narration text,
  cash_account text NOT NULL,
  vat_applicable boolean NOT NULL DEFAULT false,
  vat_amount numeric,
  vat_treatment text CHECK (vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
  linked_transaction_id text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inter_account_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number text NOT NULL,
  transfer_date timestamptz NOT NULL,
  from_account_id uuid NOT NULL,
  from_account_type text NOT NULL CHECK (from_account_type IN ('CASH', 'BANK')),
  to_account_id uuid NOT NULL,
  to_account_type text NOT NULL CHECK (to_account_type IN ('CASH', 'BANK')),
  amount numeric NOT NULL CHECK (amount > 0),
  narration text,
  status text NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
  approved_by text,
  approval_date timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (from_account_id != to_account_id)
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_book_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inter_account_transfers ENABLE ROW LEVEL SECURITY;

-- Policies for bank_accounts
CREATE POLICY "Users can read bank_accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert bank_accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bank_accounts"
  ON bank_accounts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete bank_accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for bank_transactions
CREATE POLICY "Users can read bank_transactions"
  ON bank_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert bank_transactions"
  ON bank_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bank_transactions"
  ON bank_transactions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete bank_transactions"
  ON bank_transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for cash_book_entries
CREATE POLICY "Users can read cash_book_entries"
  ON cash_book_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert cash_book_entries"
  ON cash_book_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cash_book_entries"
  ON cash_book_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete cash_book_entries"
  ON cash_book_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for inter_account_transfers
CREATE POLICY "Users can read inter_account_transfers"
  ON inter_account_transfers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert inter_account_transfers"
  ON inter_account_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inter_account_transfers"
  ON inter_account_transfers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete inter_account_transfers"
  ON inter_account_transfers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON bank_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_transactions_updated_at
BEFORE UPDATE ON bank_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_book_entries_updated_at
BEFORE UPDATE ON cash_book_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inter_account_transfers_updated_at
BEFORE UPDATE ON inter_account_transfers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();