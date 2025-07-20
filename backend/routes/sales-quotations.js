const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize sales quotations table
db.run(`
  CREATE TABLE IF NOT EXISTS sales_quotations (
    id TEXT PRIMARY KEY,
    quotation_number TEXT UNIQUE NOT NULL,
    quotation_date DATETIME NOT NULL,
    validity_date DATETIME NOT NULL,
    customer_id TEXT NOT NULL,
    customer_trn TEXT NOT NULL,
    subtotal REAL DEFAULT 0,
    vat_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONVERTED', 'EXPIRED', 'CANCELLED')),
    notes TEXT,
    terms TEXT,
    converted_to_sales_order TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all sales quotations
router.get('/', (req, res) => {
  db.all('SELECT * FROM sales_quotations ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new sales quotation
router.post('/', (req, res) => {
  const {
    quotationNumber, quotationDate, validityDate, customerId, customerTRN,
    subtotal, vatAmount, totalAmount, status, notes, terms, createdBy
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO sales_quotations (
      id, quotation_number, quotation_date, validity_date, customer_id, customer_trn,
      subtotal, vat_amount, total_amount, status, notes, terms, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, quotationNumber, quotationDate, validityDate, customerId, customerTRN,
      subtotal || 0, vatAmount || 0, totalAmount || 0, status || 'PENDING',
      notes || null, terms || null, createdBy
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create sales quotation' });
      }

      db.get('SELECT * FROM sales_quotations WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;