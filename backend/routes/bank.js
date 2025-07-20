const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize bank tables
db.run(`
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

// Get all bank accounts
router.get('/accounts', (req, res) => {
  db.all('SELECT * FROM bank_accounts WHERE is_active = 1 ORDER BY bank_name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new bank account
router.post('/accounts', (req, res) => {
  const {
    bankName, branchName, accountNumber, accountType, ifscCode,
    swiftCode, iban, openingBalance
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO bank_accounts (
      id, bank_name, branch_name, account_number, account_type,
      ifsc_code, swift_code, iban, opening_balance, current_balance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, bankName, branchName, accountNumber, accountType,
      ifscCode || null, swiftCode || null, iban, openingBalance || 0, openingBalance || 0
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create bank account' });
      }

      db.get('SELECT * FROM bank_accounts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;