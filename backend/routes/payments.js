const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize payments table
db.run(`
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all payments
router.get('/', (req, res) => {
  db.all('SELECT * FROM payments ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new payment
router.post('/', (req, res) => {
  const {
    paymentNumber, supplierId, vendorId, billId, amount, paymentMethod,
    paymentReference, date, description, status, bankAccount, chequeNumber,
    chequeDate, approvedBy, createdBy
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO payments (
      id, payment_number, supplier_id, vendor_id, bill_id, amount, payment_method,
      payment_reference, date, description, status, bank_account, cheque_number,
      cheque_date, approved_by, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, paymentNumber, supplierId || null, vendorId || null, billId || null,
      amount, paymentMethod, paymentReference || null, date, description || null,
      status || 'PENDING', bankAccount || null, chequeNumber || null,
      chequeDate || null, approvedBy || null, createdBy
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create payment' });
      }

      db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;