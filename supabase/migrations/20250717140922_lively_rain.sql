/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `date` (timestamptz)
      - `reference` (text)
      - `description` (text)
      - `debit_account_id` (uuid, references accounts)
      - `credit_account_id` (uuid, references accounts)
      - `amount` (numeric)
      - `customer_id` (uuid, references customers)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `transactions` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  reference text NOT NULL,
  description text NOT NULL,
  debit_account_id uuid NOT NULL REFERENCES accounts(id),
  credit_account_id uuid NOT NULL REFERENCES accounts(id),
  amount numeric NOT NULL CHECK (amount > 0),
  customer_id uuid REFERENCES customers(id),
  status text NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();