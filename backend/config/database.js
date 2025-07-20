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

    // UAE Customers table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS uae_customers (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        trn TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        contact_website TEXT,
        billing_street TEXT NOT NULL,
        billing_city TEXT NOT NULL,
        billing_emirate TEXT NOT NULL,
        billing_country TEXT NOT NULL,
        billing_po_box TEXT,
        shipping_street TEXT,
        shipping_city TEXT,
        shipping_emirate TEXT,
        shipping_country TEXT,
        shipping_po_box TEXT,
        customer_type TEXT NOT NULL CHECK (customer_type IN ('VAT_REGISTERED', 'NON_VAT')),
        default_vat_treatment TEXT NOT NULL CHECK (default_vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
        account_group TEXT NOT NULL CHECK (account_group IN ('DOMESTIC', 'GCC', 'EXPORT')),
        payment_terms TEXT NOT NULL,
        credit_limit REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add more tables for other modules...
    this.initializeAdditionalTables();
  }

  initializeAdditionalTables() {
    // UAE Suppliers table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS uae_suppliers (
        id TEXT PRIMARY KEY,
        supplier_name TEXT NOT NULL,
        trn TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        contact_website TEXT,
        address_street TEXT NOT NULL,
        address_city TEXT NOT NULL,
        address_emirate TEXT NOT NULL,
        address_country TEXT NOT NULL,
        address_po_box TEXT,
        supplier_type TEXT NOT NULL CHECK (supplier_type IN ('LOCAL', 'GCC', 'OVERSEAS')),
        default_vat_treatment TEXT NOT NULL CHECK (default_vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT', 'REVERSE_CHARGE')),
        payment_terms TEXT NOT NULL,
        bank_name TEXT,
        bank_account_number TEXT,
        bank_iban TEXT,
        bank_swift_code TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inventory Items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        cost_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        current_stock REAL DEFAULT 0,
        minimum_stock REAL DEFAULT 0,
        maximum_stock REAL DEFAULT 0,
        reorder_level REAL DEFAULT 0,
        location TEXT,
        supplier TEXT,
        barcode TEXT,
        expiry_date DATETIME,
        batch_number TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Receipts table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS receipts (
        id TEXT PRIMARY KEY,
        receipt_number TEXT UNIQUE NOT NULL,
        customer_id TEXT NOT NULL,
        invoice_id TEXT,
        amount REAL NOT NULL CHECK (amount > 0),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE')),
        payment_reference TEXT,
        date DATETIME NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK (status IN ('PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED')),
        bank_account TEXT,
        cheque_number TEXT,
        cheque_date DATETIME,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      )
    `);

    // Payments table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        payment_number TEXT UNIQUE NOT NULL,
        supplier_id TEXT,
        vendor_id TEXT,
        bill_id TEXT,
        amount REAL NOT NULL CHECK (amount > 0),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE')),
        payment_reference TEXT,
        date DATETIME NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK (status IN ('PENDING', 'CLEARED', 'BOUNCED', 'CANCELLED')),
        bank_account TEXT,
        cheque_number TEXT,
        cheque_date DATETIME,
        approved_by TEXT,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES uae_suppliers(id)
      )
    `);

    // Bank Accounts table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        bank_name TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_type TEXT NOT NULL CHECK (account_type IN ('CURRENT', 'SAVINGS', 'FIXED_DEPOSIT')),
        ifsc_code TEXT,
        swift_code TEXT,
        iban TEXT NOT NULL,
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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