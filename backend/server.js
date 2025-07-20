const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const customerRoutes = require('./routes/customers');
const transactionRoutes = require('./routes/transactions');
const invoiceRoutes = require('./routes/invoices');
const uaeCustomerRoutes = require('./routes/uae-customers');
const uaeSupplierRoutes = require('./routes/uae-suppliers');
const salesQuotationRoutes = require('./routes/sales-quotations');
const purchaseInvoiceRoutes = require('./routes/purchase-invoices');
const inventoryRoutes = require('./routes/inventory');
const receiptRoutes = require('./routes/receipts');
const paymentRoutes = require('./routes/payments');
const bankRoutes = require('./routes/bank');
const cashBookRoutes = require('./routes/cash-book');
const transferRoutes = require('./routes/transfers');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/uae-customers', uaeCustomerRoutes);
app.use('/api/uae-suppliers', uaeSupplierRoutes);
app.use('/api/sales-quotations', salesQuotationRoutes);
app.use('/api/purchase-invoices', purchaseInvoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/cash-book', cashBookRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Accounting Backend API ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;