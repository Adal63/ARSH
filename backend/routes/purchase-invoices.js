const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize purchase invoices table
db.run(`
  CREATE TABLE IF NOT EXISTS purchase_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATETIME NOT NULL,
    supplier_id TEXT NOT NULL,
    supplier_trn TEXT NOT NULL,
    subtotal REAL DEFAULT 0,
    vat_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    input_vat_recoverable REAL DEFAULT 0,
    reverse_charge_applicable BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID')),
    payment_due_date DATETIME NOT NULL,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all purchase invoices
router.get('/', (req, res) => {
  db.all('SELECT * FROM purchase_invoices ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new purchase invoice
router.post('/', (req, res) => {
  const {
    invoiceNumber, invoiceDate, supplierId, supplierTRN, subtotal, vatAmount,
    totalAmount, inputVATRecoverable, reverseChargeApplicable, status,
    paymentDueDate, notes, createdBy
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO purchase_invoices (
      id, invoice_number, invoice_date, supplier_id, supplier_trn,
      subtotal, vat_amount, total_amount, input_vat_recoverable,
      reverse_charge_applicable, status, payment_due_date, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, invoiceNumber, invoiceDate, supplierId, supplierTRN,
      subtotal || 0, vatAmount || 0, totalAmount || 0, inputVATRecoverable || 0,
      reverseChargeApplicable || 0, status || 'PENDING', paymentDueDate, notes || null, createdBy
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create purchase invoice' });
      }

      db.get('SELECT * FROM purchase_invoices WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;