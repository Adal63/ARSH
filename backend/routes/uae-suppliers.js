const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize UAE suppliers table
db.run(`
  CREATE TABLE IF NOT EXISTS uae_suppliers (
    id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    trn TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_website TEXT,
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_emirate TEXT NOT NULL,
    address_country TEXT NOT NULL,
    address_po_box TEXT,
    supplier_type TEXT NOT NULL CHECK (supplier_type IN ('LOCAL', 'GCC', 'OVERSEAS')),
    default_vat_treatment TEXT NOT NULL CHECK (default_vat_treatment IN ('STANDARD_RATED', 'ZERO_RATED', 'EXEMPT', 'REVERSE_CHARGE')),
    payment_terms TEXT NOT NULL,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_iban TEXT,
    bank_swift_code TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all UAE suppliers
router.get('/', (req, res) => {
  db.all('SELECT * FROM uae_suppliers ORDER BY supplier_name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new UAE supplier
router.post('/', [
  body('supplierName').trim().isLength({ min: 1 }),
  body('trn').trim().isLength({ min: 15, max: 15 }),
  body('phone').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    supplierName, trn, phone, email, website, street, city, emirate, country, poBox,
    supplierType, defaultVATTreatment, paymentTerms, bankName, accountNumber, iban, swiftCode
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO uae_suppliers (
      id, supplier_name, trn, contact_phone, contact_email, contact_website,
      address_street, address_city, address_emirate, address_country, address_po_box,
      supplier_type, default_vat_treatment, payment_terms,
      bank_name, bank_account_number, bank_iban, bank_swift_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, supplierName, trn, phone, email, website || null,
      street, city, emirate, country, poBox || null,
      supplierType, defaultVATTreatment, paymentTerms,
      bankName || null, accountNumber || null, iban || null, swiftCode || null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create UAE supplier' });
      }

      db.get('SELECT * FROM uae_suppliers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;