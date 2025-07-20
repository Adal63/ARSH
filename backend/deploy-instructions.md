# AWS Deployment Instructions

## Prerequisites
1. AWS Free Tier account ✅ (You have this)
2. EB CLI installed ✅ (We're working on this)
3. AWS credentials configured

## Step-by-Step Deployment

### 1. Complete EB CLI Setup
First, make sure your EB CLI is working:
```bash
# In your virtual environment
eb --version
```

### 2. Configure AWS Credentials
```bash
# Option 1: Using AWS CLI (recommended)
aws configure

# Option 2: Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### 3. Create S3 Bucket for File Uploads
```bash
# Create S3 bucket (replace with unique name)
aws s3 mb s3://your-accounting-app-uploads-unique-name --region us-east-1
```

### 4. Deploy Backend to Elastic Beanstalk
```bash
# Navigate to backend directory
cd backend

# Initialize EB application
eb init
# Choose:
# - Region: us-east-1 (or your preferred region)
# - Application name: accounting-backend
# - Platform: Node.js
# - SSH: No (for now)

# Create environment
eb create production
# Choose:
# - Environment name: accounting-production
# - DNS CNAME: accounting-backend-prod (or available name)
# - Load balancer: Application
# - Instance type: t3.micro (FREE TIER)

# Set environment variables
eb setenv JWT_SECRET=your-super-secret-jwt-key-change-this
eb setenv S3_BUCKET_NAME=your-accounting-app-uploads-unique-name
eb setenv AWS_REGION=us-east-1
eb setenv NODE_ENV=production

# Deploy
eb deploy

# Get your backend URL
eb status
```

### 5. Update Frontend Configuration
After deployment, update your frontend `.env` file:
```env
VITE_API_URL=https://your-app-name.us-east-1.elasticbeanstalk.com/api
```

### 6. Test Your Deployment
```bash
# Open your backend in browser
eb open

# Test health endpoint
curl https://your-app-name.us-east-1.elasticbeanstalk.com/health
```

## What You Need to Do

1. **Get AWS Credentials**:
   - Go to AWS Console → IAM → Users
   - Create a new user with programmatic access
   - Attach policies: `AWSElasticBeanstalkFullAccess`, `AmazonS3FullAccess`
   - Save the Access Key ID and Secret Access Key

2. **Choose Unique S3 Bucket Name**:
   - Replace `your-accounting-app-uploads-unique-name` with something unique
   - Example: `accounting-app-uploads-yourname-2024`

3. **Set Strong JWT Secret**:
   - Generate a strong random string for JWT_SECRET
   - Example: `your-super-secret-jwt-key-change-this-to-something-random`

## Free Tier Resources Used
- **EC2**: t3.micro instance (750 hours/month free)
- **S3**: 5GB storage free
- **Application Load Balancer**: 750 hours/month free
- **Data Transfer**: 15GB/month free

## Monitoring Usage
- Check AWS Billing Dashboard regularly
- Set up billing alerts
- Monitor free tier usage in AWS Console

## Next Steps After Deployment
1. Update frontend environment variables
2. Test all API endpoints
3. Set up proper error monitoring
4. Configure backup strategies
5. Set up CI/CD pipeline (optional)

## Troubleshooting
- Check EB logs: `eb logs`
- Monitor CloudWatch logs in AWS Console
- Verify environment variables: `eb printenv`
- Check application health: `eb health`