const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize receipts table
db.run(`
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all receipts
router.get('/', (req, res) => {
  db.all('SELECT * FROM receipts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new receipt
router.post('/', (req, res) => {
  const {
    receiptNumber, customerId, invoiceId, amount, paymentMethod, paymentReference,
    date, description, status, bankAccount, chequeNumber, chequeDate, createdBy
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO receipts (
      id, receipt_number, customer_id, invoice_id, amount, payment_method,
      payment_reference, date, description, status, bank_account,
      cheque_number, cheque_date, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, receiptNumber, customerId, invoiceId || null, amount, paymentMethod,
      paymentReference || null, date, description || null, status || 'PENDING',
      bankAccount || null, chequeNumber || null, chequeDate || null, createdBy
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create receipt' });
      }

      db.get('SELECT * FROM receipts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;