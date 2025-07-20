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
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse items JSON for each invoice
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
      return res.status(500).json({ error: 'Database error' });
    }
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get invoice items
    db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err, items) => {
      if (err) {
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

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert invoice
    db.run(
      `INSERT INTO invoices (
        id, invoice_number, customer_id, date, due_date, total, status,
        mj_no, sales_order, sales_quote, description, project, division,
        closed_invoice, withholding_tax, discount, chasis_no, vehicle_no,
        car_model, service_kms, terms_conditions, cost_of_sales,
        approved_by, created_by, credit_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId, invoice_number, customer_id, date, due_date, total, status || 'draft',
        mj_no, sales_order, sales_quote, description, project, division,
        closed_invoice || 0, withholding_tax || 0, discount || 0, chasis_no, vehicle_no,
        car_model, service_kms, terms_conditions, cost_of_sales || 0,
        approved_by, created_by, credit_by
      ],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Invoice number already exists' });
          }
          return res.status(500).json({ error: 'Failed to create invoice' });
        }

        // Insert invoice items
        const itemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            const itemId = uuidv4();
            db.run(
              'INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)',
              [itemId, invoiceId, item.description, item.quantity, item.rate, item.amount],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(itemPromises)
          .then(() => {
            db.run('COMMIT');
            
            // Return the created invoice with items
            db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId], (err, invoice) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId], (err, items) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }

                res.status(201).json({ ...invoice, items });
              });
            });
          })
          .catch(() => {
            db.run('ROLLBACK');
            res.status(500).json({ error: 'Failed to create invoice items' });
          });
      }
    );
  });
});

// Update invoice
router.put('/:id', [
  body('invoice_number').trim().isLength({ min: 1 }),
  body('customer_id').trim().isLength({ min: 1 }),
  body('date').isISO8601(),
  body('due_date').isISO8601()
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

  const total = items ? items.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Update invoice
    db.run(
      `UPDATE invoices SET 
        invoice_number = ?, customer_id = ?, date = ?, due_date = ?, total = ?, status = ?,
        mj_no = ?, sales_order = ?, sales_quote = ?, description = ?, project = ?, division = ?,
        closed_invoice = ?, withholding_tax = ?, discount = ?, chasis_no = ?, vehicle_no = ?,
        car_model = ?, service_kms = ?, terms_conditions = ?, cost_of_sales = ?,
        approved_by = ?, created_by = ?, credit_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        invoice_number, customer_id, date, due_date, total, status,
        mj_no, sales_order, sales_quote, description, project, division,
        closed_invoice, withholding_tax, discount, chasis_no, vehicle_no,
        car_model, service_kms, terms_conditions, cost_of_sales,
        approved_by, created_by, credit_by, req.params.id
      ],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to update invoice' });
        }

        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Invoice not found' });
        }

        // Update items if provided
        if (items) {
          // Delete existing items
          db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update invoice items' });
            }

            // Insert new items
            const itemPromises = items.map(item => {
              return new Promise((resolve, reject) => {
                const itemId = uuidv4();
                db.run(
                  'INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)',
                  [itemId, req.params.id, item.description, item.quantity, item.rate, item.amount],
                  function(err) {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(itemPromises)
              .then(() => {
                db.run('COMMIT');
                
                // Return updated invoice with items
                db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id], (err, invoice) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' });
                  }

                  db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err, items) => {
                    if (err) {
                      return res.status(500).json({ error: 'Database error' });
                    }

                    res.json({ ...invoice, items });
                  });
                });
              })
              .catch(() => {
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Failed to update invoice items' });
              });
          });
        } else {
          db.run('COMMIT');
          
          // Return updated invoice
          db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id], (err, invoice) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json(invoice);
          });
        }
      }
    );
  });
});

// Delete invoice
router.delete('/:id', (req, res) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Delete invoice items first (due to foreign key)
    db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to delete invoice items' });
      }

      // Delete invoice
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