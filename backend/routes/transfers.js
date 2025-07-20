const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize transfers table
db.run(`
  CREATE TABLE IF NOT EXISTS inter_account_transfers (
    id TEXT PRIMARY KEY,
    transfer_number TEXT NOT NULL,
    transfer_date DATETIME NOT NULL,
    from_account_id TEXT NOT NULL,
    from_account_type TEXT NOT NULL CHECK (from_account_type IN ('CASH', 'BANK')),
    to_account_id TEXT NOT NULL,
    to_account_type TEXT NOT NULL CHECK (to_account_type IN ('CASH', 'BANK')),
    amount REAL NOT NULL CHECK (amount > 0),
    narration TEXT,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    approved_by TEXT,
    approval_date DATETIME,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (from_account_id != to_account_id)
  )
`);

// Get all transfers
router.get('/', (req, res) => {
  db.all('SELECT * FROM inter_account_transfers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new transfer
router.post('/', (req, res) => {
  const {
    transferNumber, transferDate, fromAccountId, fromAccountType,
    toAccountId, toAccountType, amount, narration, status, createdBy
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO inter_account_transfers (
      id, transfer_number, transfer_date, from_account_id, from_account_type,
      to_account_id, to_account_type, amount, narration, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, transferNumber, transferDate, fromAccountId, fromAccountType,
      toAccountId, toAccountType, amount, narration || null, status || 'PENDING', createdBy
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create transfer' });
      }

      db.get('SELECT * FROM inter_account_transfers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;