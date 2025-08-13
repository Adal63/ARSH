const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = database.getDb();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all invoices with items
router.get('/', (req, res) => {
  const query = `
    SELECT i.*,
    GROUP_CONCAT(
      json_object(
        'id', ii.id,
        'description', ii.description,
        'quantity', ii.quantity,
        'rate', ii.rate,
        'amount', ii.amount
      )
    ) as items_json
    FROM invoices i
    LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const invoices = rows.map(row => ({
      ...row,
      items: row.items_json ? JSON.parse(`[${row.items_json}]`) : []
    }));

    res.json(invoices);
  });
});

// Get invoice by ID with items
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id], (err, invoice) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err, items) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ ...invoice, items });
    });
  });
});

// Create new invoice
router.post('/', [
  body('invoice_number').trim().isLength({ min: 1 }),
  body('customer_id').trim().isLength({ min: 1 }),
  body('date').isISO8601(),
  body('due_date').isISO8601(),
  body('items').isArray({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    invoice_number, customer_id, date, due_date, status, items,
    mj_no, sales_order, sales_quote, description, project, division,
    closed_invoice, withholding_tax, discount, chasis_no, vehicle_no,
    car_model, service_kms, terms_conditions, cost_of_sales,
    approved_by, created_by, credit_by
  } = req.body;

  const invoiceId = uuidv4();
  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(`
      INSERT INTO invoices (
        id, invoice_number, customer_id, date, due_date, total, status,
        mj_no, sales_order, sales_quote, description, project, division,
        closed_invoice, withholding_tax, discount, chasis_no, vehicle_no,
        car_model, service_kms, terms_conditions, cost_of_sales,
        approved_by, created_by, credit_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      invoiceId, invoice_number, customer_id, date, due_date, total, status || 'draft',
      mj_no, sales_order, sales_quote, description, project, division,
      closed_invoice, withholding_tax, discount, chasis_no, vehicle_no,
      car_model, service_kms, terms_conditions, cost_of_sales,
      approved_by, created_by, credit_by
    ], function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error creating invoice:', err);
        return res.status(500).json({ error: 'Failed to create invoice' });
      }

      // Insert invoice items
      if (items && items.length > 0) {
        const itemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount, created_at)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            `, [uuidv4(), invoiceId, item.description, item.quantity, item.rate, item.amount], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });

        Promise.all(itemPromises)
          .then(() => {
            db.run('COMMIT');
            res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
          })
          .catch(() => {
            db.run('ROLLBACK');
            res.status(500).json({ error: 'Failed to create invoice items' });
          });
      } else {
        db.run('COMMIT');
        res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
      }
    });
  });
});

// Update invoice
router.put('/:id', [
  body('invoice_number').optional().trim().isLength({ min: 1 }),
  body('customer_id').optional().trim().isLength({ min: 1 }),
  body('date').optional().isISO8601(),
  body('due_date').optional().isISO8601()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const fields = [];
  const values = [];
  
  Object.keys(req.body).forEach(key => {
    if (key !== 'items' && req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  });
  
  values.push(req.params.id);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `UPDATE invoices SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to update invoice' });
        }
        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Invoice not found' });
        }
        if (req.body.items) {
          // Delete existing items first
          db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update invoice items' });
            }
            // Insert new items
            const itemPromises = req.body.items.map(item => {
              return new Promise((resolve, reject) => {
                db.run(`
                  INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                `, [uuidv4(), req.params.id, item.description, item.quantity, item.rate, item.amount], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            });
            Promise.all(itemPromises)
              .then(() => {
                db.run('COMMIT');
                res.json({ message: 'Invoice updated successfully' });
              })
              .catch(() => {
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Failed to update invoice items' });
              });
          });
        } else {
          db.run('COMMIT');
          res.json({ message: 'Invoice updated successfully' });
        }
      }
    );
  });
});
// Delete invoice
router.delete('/:id', (req, res) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to delete invoice items' });
      }
      db.run('DELETE FROM invoices WHERE id = ?', [req.params.id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to delete invoice' });
        }
        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Invoice not found' });
        }
        db.run('COMMIT');
        res.json({ message: 'Invoice deleted successfully' });
      });
    });
  });
});
module.exports = router;
