const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Initialize inventory table
db.run(`
  CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    cost_price REAL DEFAULT 0,
    selling_price REAL DEFAULT 0,
    current_stock REAL DEFAULT 0,
    minimum_stock REAL DEFAULT 0,
    maximum_stock REAL DEFAULT 0,
    reorder_level REAL DEFAULT 0,
    location TEXT,
    supplier TEXT,
    barcode TEXT,
    expiry_date DATETIME,
    batch_number TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all inventory items
router.get('/', (req, res) => {
  db.all('SELECT * FROM inventory_items WHERE is_active = 1 ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new inventory item
router.post('/', (req, res) => {
  const {
    code, name, description, category, unit, costPrice, sellingPrice,
    currentStock, minimumStock, maximumStock, reorderLevel, location, supplier, barcode
  } = req.body;
  
  const id = uuidv4();

  db.run(
    `INSERT INTO inventory_items (
      id, code, name, description, category, unit, cost_price, selling_price,
      current_stock, minimum_stock, maximum_stock, reorder_level, location, supplier, barcode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, code, name, description || null, category, unit, costPrice || 0, sellingPrice || 0,
      currentStock || 0, minimumStock || 0, maximumStock || 0, reorderLevel || 0,
      location || null, supplier || null, barcode || null
    ],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Item code already exists' });
        }
        return res.status(500).json({ error: 'Failed to create inventory item' });
      }

      db.get('SELECT * FROM inventory_items WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

module.exports = router;