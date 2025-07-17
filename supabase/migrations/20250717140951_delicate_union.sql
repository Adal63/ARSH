/*
  # Create inventory tables

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `unit` (text)
      - `cost_price` (numeric)
      - `selling_price` (numeric)
      - `current_stock` (numeric)
      - `minimum_stock` (numeric)
      - `maximum_stock` (numeric)
      - `reorder_level` (numeric)
      - `location` (text)
      - `supplier` (text)
      - `barcode` (text)
      - `expiry_date` (timestamptz)
      - `batch_number` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stock_movements`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references inventory_items)
      - `type` (text)
      - `quantity` (numeric)
      - `unit_cost` (numeric)
      - `total_cost` (numeric)
      - `reference` (text)
      - `description` (text)
      - `from_location` (text)
      - `to_location` (text)
      - `date` (timestamptz)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stock_allocations`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references inventory_items)
      - `order_id` (text)
      - `customer_id` (uuid, references customers)
      - `allocated_quantity` (numeric)
      - `reserved_quantity` (numeric)
      - `available_quantity` (numeric)
      - `allocation_date` (timestamptz)
      - `expiry_date` (timestamptz)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  unit text NOT NULL,
  cost_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  current_stock numeric NOT NULL DEFAULT 0,
  minimum_stock numeric NOT NULL DEFAULT 0,
  maximum_stock numeric NOT NULL DEFAULT 0,
  reorder_level numeric NOT NULL DEFAULT 0,
  location text,
  supplier text,
  barcode text,
  expiry_date timestamptz,
  batch_number text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES inventory_items(id),
  type text NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER')),
  quantity numeric NOT NULL,
  unit_cost numeric NOT NULL,
  total_cost numeric NOT NULL,
  reference text,
  description text,
  from_location text,
  to_location text,
  date timestamptz NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES inventory_items(id),
  order_id text,
  customer_id uuid REFERENCES customers(id),
  allocated_quantity numeric NOT NULL DEFAULT 0,
  reserved_quantity numeric NOT NULL DEFAULT 0,
  available_quantity numeric NOT NULL DEFAULT 0,
  allocation_date timestamptz NOT NULL,
  expiry_date timestamptz,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'FULFILLED', 'CANCELLED')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_allocations ENABLE ROW LEVEL SECURITY;

-- Policies for inventory_items
CREATE POLICY "Users can read inventory_items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert inventory_items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update inventory_items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete inventory_items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for stock_movements
CREATE POLICY "Users can read stock_movements"
  ON stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock_movements"
  ON stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update stock_movements"
  ON stock_movements
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete stock_movements"
  ON stock_movements
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for stock_allocations
CREATE POLICY "Users can read stock_allocations"
  ON stock_allocations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock_allocations"
  ON stock_allocations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update stock_allocations"
  ON stock_allocations
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete stock_allocations"
  ON stock_allocations
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_movements_updated_at
BEFORE UPDATE ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_allocations_updated_at
BEFORE UPDATE ON stock_allocations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();