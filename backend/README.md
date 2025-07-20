# Accounting Backend API

AWS-hosted Node.js backend for the Comprehensive Accounting Software.

## Features

- ✅ User Authentication (JWT)
- ✅ Complete CRUD operations for all modules
- ✅ File upload to AWS S3
- ✅ SQLite database
- ✅ Rate limiting and security
- ✅ AWS Elastic Beanstalk ready

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Core Modules
- `GET/POST/PUT/DELETE /api/accounts` - Chart of Accounts
- `GET/POST/PUT/DELETE /api/customers` - Customer Management
- `GET/POST/PUT/DELETE /api/transactions` - Transactions
- `GET/POST/PUT/DELETE /api/invoices` - Invoices

### UAE FTA Modules
- `GET/POST/PUT/DELETE /api/uae-customers` - UAE Customers
- `GET/POST/PUT/DELETE /api/uae-suppliers` - UAE Suppliers
- `GET/POST/PUT/DELETE /api/sales-quotations` - Sales Quotations
- `GET/POST/PUT/DELETE /api/purchase-invoices` - Purchase Invoices

### Additional Modules
- `GET/POST/PUT/DELETE /api/inventory` - Inventory Management
- `GET/POST/PUT/DELETE /api/receipts` - Receipts
- `GET/POST/PUT/DELETE /api/payments` - Payments
- `GET/POST/PUT/DELETE /api/bank` - Bank Management
- `GET/POST/PUT/DELETE /api/cash-book` - Cash Book
- `GET/POST/PUT/DELETE /api/transfers` - Inter-Account Transfers

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/signed-url/:key` - Get signed URL for file access
- `DELETE /api/upload/:key` - Delete file

## Deployment Steps

1. **Install EB CLI** (if not already done):
   ```bash
   pip install awsebcli --upgrade --user
   ```

2. **Initialize EB Application**:
   ```bash
   cd backend
   eb init
   ```
   - Choose your AWS region
   - Select Node.js platform
   - Choose application name

3. **Create Environment**:
   ```bash
   eb create production
   ```
   - Choose environment name
   - Select load balancer type (Application)
   - Choose instance type (t3.micro for free tier)

4. **Set Environment Variables**:
   ```bash
   eb setenv JWT_SECRET=your-super-secret-key
   eb setenv S3_BUCKET_NAME=your-bucket-name
   eb setenv FRONTEND_URL=https://your-frontend-domain.com
   ```

5. **Deploy**:
   ```bash
   eb deploy
   ```

6. **Open Application**:
   ```bash
   eb open
   ```

## Environment Variables Required

Create a `.env` file with these variables:

```env
JWT_SECRET=your-super-secret-jwt-key
S3_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=us-east-1
FRONTEND_URL=https://your-frontend-domain.com
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with required variables

3. Start development server:
   ```bash
   npm run dev
   ```

## AWS Services Used

- **Elastic Beanstalk**: Application hosting
- **EC2**: Compute instances (t3.micro for free tier)
- **S3**: File storage
- **Application Load Balancer**: Traffic distribution
- **CloudWatch**: Monitoring and logs

## Free Tier Considerations

- Uses t3.micro instances (free tier eligible)
- SQLite database (no additional database costs)
- S3 storage (5GB free tier)
- Application Load Balancer (750 hours free)
- CloudWatch logs (5GB free)

Monitor your usage in AWS Console to stay within free tier limits.