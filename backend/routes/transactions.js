const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all transactions
router.get('/', (req, res) => {
  const query = `
    SELECT t.*, 
           da.name as debit_account_name, da.code as debit_account_code,
           ca.name as credit_account_name, ca.code as credit_account_code,
           c.name as customer_name
    FROM transactions t
    LEFT JOIN accounts da ON t.debit_account_id = da.id
    LEFT JOIN accounts ca ON t.credit_account_id = ca.id
    LEFT JOIN customers c ON t.customer_id = c.id
    ORDER BY t.created_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new transaction
router.post('/', [
  body('date').isISO8601(),
  body('reference').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('debitAccount').trim().isLength({ min: 1 }),
  body('creditAccount').trim().isLength({ min: 1 }),
  body('amount').isNumeric().isFloat({ min: 0.01 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, reference, description, debitAccount, creditAccount, amount, customerId, status } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO transactions (id, date, reference, description, debit_account_id, credit_account_id, amount, customer_id, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, date, reference, description, debitAccount, creditAccount, amount, customerId || null, status || 'Pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create transaction' });
      }

      // Return the created transaction with joined data
      const query = `
        SELECT t.*, 
               da.name as debit_account_name, da.code as debit_account_code,
               ca.name as credit_account_name, ca.code as credit_account_code,
               c.name as customer_name
        FROM transactions t
        LEFT JOIN accounts da ON t.debit_account_id = da.id
        LEFT JOIN accounts ca ON t.credit_account_id = ca.id
        LEFT JOIN customers c ON t.customer_id = c.id
        WHERE t.id = ?
      `;

      db.get(query, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;