const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all accounts
router.get('/', (req, res) => {
  db.all('SELECT * FROM accounts WHERE is_active = 1 ORDER BY code', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get account by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM accounts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(row);
  });
});

// Create new account
router.post('/', [
  body('code').trim().isLength({ min: 1 }),
  body('name').trim().isLength({ min: 1 }),
  body('type').isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  body('category').trim().isLength({ min: 1 }),
  body('balance').isNumeric()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, name, type, category, balance, parent_id } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO accounts (id, code, name, type, category, balance, parent_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, code, name, type, category, balance || 0, parent_id || null],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Account code already exists' });
        }
        return res.status(500).json({ error: 'Failed to create account' });
      }

      // Return the created account
      db.get('SELECT * FROM accounts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update account
router.put('/:id', [
  body('code').trim().isLength({ min: 1 }),
  body('name').trim().isLength({ min: 1 }),
  body('type').isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  body('category').trim().isLength({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, name, type, category, balance, parent_id, is_active } = req.body;

  db.run(
    `UPDATE accounts 
     SET code = ?, name = ?, type = ?, category = ?, balance = ?, parent_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [code, name, type, category, balance, parent_id, is_active !== undefined ? is_active : 1, req.params.id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Account code already exists' });
        }
        return res.status(500).json({ error: 'Failed to update account' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Return the updated account
      db.get('SELECT * FROM accounts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

// Delete account
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM accounts WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  });
});

module.exports = router;