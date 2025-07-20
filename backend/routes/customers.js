const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all customers
router.get('/', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get customer by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(row);
  });
});

// Create new customer
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().isLength({ min: 1 }),
  body('company').trim().isLength({ min: 1 }),
  body('address').trim().isLength({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, address, company, status, total_revenue, last_contact, notes } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO customers (id, name, email, phone, address, company, status, total_revenue, last_contact, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, email, phone, address, company, status || 'Active', total_revenue || 0, last_contact, notes || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create customer' });
      }

      // Return the created customer
      db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update customer
router.put('/:id', [
  body('name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().isLength({ min: 1 }),
  body('company').trim().isLength({ min: 1 }),
  body('address').trim().isLength({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, address, company, status, total_revenue, last_contact, notes } = req.body;

  db.run(
    `UPDATE customers 
     SET name = ?, email = ?, phone = ?, address = ?, company = ?, status = ?, total_revenue = ?, last_contact = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, email, phone, address, company, status, total_revenue, last_contact, notes, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update customer' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Return the updated customer
      db.get('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

// Delete customer
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete customer' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  });
});

module.exports = router;