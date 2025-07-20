const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize cash book table
db.run(`
  CREATE TABLE IF NOT EXISTS cash_book_entries (
    id TEXT PRIMARY KEY,
    date DATETIME NOT NULL,
    voucher_number TEXT NOT NULL,
    particulars TEXT NOT NULL,
    debit_amount REAL DEFAULT 0,
    credit_amount REAL DEFAULT 0,
    balance REAL NOT NULL,
    narration TEXT,
    cash_account TEXT NOT NULL,
    vat_applicable BOOLEAN DEFAULT 0,
    vat_amount REAL,
    vat_treatment TEXT CHECK (vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
    linked_transaction_id TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all cash book entries
router.get('/', (req, res) => {
  db.all('SELECT * FROM cash_book_entries ORDER BY date DESC, created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new cash book entry
router.post('/', (req, res) => {
  const {
    date, voucherNumber, particulars, debitAmount, creditAmount, balance,
    narration, cashAccount, vatApplicable, vatAmount, vatTreatment,
    linkedTransactionId, createdBy
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO cash_book_entries (
      id, date, voucher_number, particulars, debit_amount, credit_amount,
      balance, narration, cash_account, vat_applicable, vat_amount,
      vat_treatment, linked_transaction_id, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, date, voucherNumber, particulars, debitAmount || 0, creditAmount || 0,
      balance, narration || null, cashAccount, vatApplicable || 0,
      vatAmount || null, vatTreatment || null, linkedTransactionId || null, createdBy
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create cash book entry' });
      }

      db.get('SELECT * FROM cash_book_entries WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;