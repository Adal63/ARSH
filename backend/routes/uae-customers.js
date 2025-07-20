const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize UAE customers table
db.run(`
  CREATE TABLE IF NOT EXISTS uae_customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    trn TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_website TEXT,
    billing_street TEXT NOT NULL,
    billing_city TEXT NOT NULL,
    billing_emirate TEXT NOT NULL,
    billing_country TEXT NOT NULL,
    billing_po_box TEXT,
    shipping_street TEXT,
    shipping_city TEXT,
    shipping_emirate TEXT,
    shipping_country TEXT,
    shipping_po_box TEXT,
    customer_type TEXT NOT NULL CHECK (customer_type IN ('VAT_REGISTERED', 'NON_VAT')),
    default_vat_treatment TEXT NOT NULL CHECK (default_vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT')),
    account_group TEXT NOT NULL CHECK (account_group IN ('DOMESTIC', 'GCC', 'EXPORT')),
    payment_terms TEXT NOT NULL,
    credit_limit REAL DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all UAE customers
router.get('/', (req, res) => {
  db.all('SELECT * FROM uae_customers ORDER BY customer_name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new UAE customer
router.post('/', [
  body('customerName').trim().isLength({ min: 1 }),
  body('trn').trim().isLength({ min: 15, max: 15 }),
  body('phone').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    customerName, trn, phone, email, website, street, city, emirate, country, poBox,
    customerType, defaultVATTreatment, accountGroup, paymentTerms, creditLimit
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO uae_customers (
      id, customer_name, trn, contact_phone, contact_email, contact_website,
      billing_street, billing_city, billing_emirate, billing_country, billing_po_box,
      customer_type, default_vat_treatment, account_group, payment_terms, credit_limit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, customerName, trn, phone, email, website || null,
      street, city, emirate, country, poBox || null,
      customerType, defaultVATTreatment, accountGroup, paymentTerms, creditLimit || 0
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create UAE customer' });
      }

      db.get('SELECT * FROM uae_customers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update UAE customer
router.put('/:id', (req, res) => {
  const {
    customerName, trn, phone, email, website, street, city, emirate, country, poBox,
    customerType, defaultVATTreatment, accountGroup, paymentTerms, creditLimit
  } = req.body;

  db.run(
    `UPDATE uae_customers SET 
      customer_name = ?, trn = ?, contact_phone = ?, contact_email = ?, contact_website = ?,
      billing_street = ?, billing_city = ?, billing_emirate = ?, billing_country = ?, billing_po_box = ?,
      customer_type = ?, default_vat_treatment = ?, account_group = ?, payment_terms = ?, credit_limit = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      customerName, trn, phone, email, website,
      street, city, emirate, country, poBox,
      customerType, defaultVATTreatment, accountGroup, paymentTerms, creditLimit,
      req.params.id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update UAE customer' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'UAE customer not found' });
      }

      db.get('SELECT * FROM uae_customers WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

// Delete UAE customer
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM uae_customers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete UAE customer' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'UAE customer not found' });
    }

    res.json({ message: 'UAE customer deleted successfully' });
  });
});

module.exports = router;