const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(process.env.DB_PATH || './database/accounting.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './database/accounting.db';

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('📁 Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Accounts table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
        category TEXT NOT NULL,
        balance REAL DEFAULT 0,
        parent_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES accounts(id)
      )
    `);

    // Customers table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        company TEXT,
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Prospect')),
        total_revenue REAL DEFAULT 0,
        last_contact DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date DATETIME NOT NULL,
        reference TEXT NOT NULL,
        description TEXT NOT NULL,
        debit_account_id TEXT NOT NULL,
        credit_account_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        customer_id TEXT,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (debit_account_id) REFERENCES accounts(id),
        FOREIGN KEY (credit_account_id) REFERENCES accounts(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Invoices table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        due_date DATETIME NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue')),
        mj_no TEXT,
        sales_order TEXT,
        sales_quote TEXT,
        description TEXT,
        project TEXT,
        division TEXT,
        closed_invoice BOOLEAN DEFAULT 0,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Invoice items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        rate REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized');
  }

  getDb() {
    return this.db;
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = new Database();