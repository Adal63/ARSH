const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

const initializeDatabase = () => {
  const dbPath = path.join(__dirname, '..', 'accounting.db');
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
};

const createTables = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Invoices table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      mj_no TEXT,
      sales_order TEXT,
      sales_quote TEXT,
      description TEXT,
      project TEXT,
      division TEXT,
      closed_invoice INTEGER DEFAULT 0,
      withholding_tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      chasis_no TEXT,
      vehicle_no TEXT,
      car_model TEXT,
      service_kms TEXT,
      terms_conditions TEXT,
      cost_of_sales REAL DEFAULT 0,
      approved_by TEXT,
      created_by TEXT,
      credit_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Invoice items table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (invoice_id) REFERENCES invoices (id)
    )
  `);

  // Add other tables as needed...
  console.log('Database tables created successfully');
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

module.exports = {
  initializeDatabase,
  getDb
};
