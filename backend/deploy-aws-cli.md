# Deploy Backend Using AWS CLI (Alternative to EB CLI)

Since EB CLI is having DLL issues on your Windows system, let's use AWS CLI which is more reliable.

## Step 1: Install AWS CLI

1. **Download AWS CLI v2 for Windows**:
   - Go to: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Download and install the MSI file
   - This is more reliable than pip installation

2. **Verify Installation**:
   ```cmd
   aws --version
   ```

## Step 2: Configure AWS CLI

1. **Get Your AWS Credentials**:
   - Go to AWS Console → IAM → Users
   - Click "Create User"
   - Username: `eb-deployment-user`
   - Select "Programmatic access"
   - Attach policies:
     - `AWSElasticBeanstalkFullAccess`
     - `AmazonS3FullAccess`
     - `IAMReadOnlyAccess`
   - Save your Access Key ID and Secret Access Key

2. **Configure AWS CLI**:
   ```cmd
   aws configure
   ```
   Enter:
   - AWS Access Key ID: [Your Access Key]
   - AWS Secret Access Key: [Your Secret Key]
   - Default region name: `us-east-1`
   - Default output format: `json`

## Step 3: Create S3 Bucket for File Uploads

```cmd
aws s3 mb s3://accounting-app-uploads-[YOUR-UNIQUE-SUFFIX] --region us-east-1
```
Replace `[YOUR-UNIQUE-SUFFIX]` with something unique like your name or random numbers.

## Step 4: Prepare Backend for Deployment

1. **Navigate to backend directory**:
   ```cmd
   cd backend
   ```

2. **Create environment file**:
   Copy `.env.example` to `.env` and fill in:
   ```env
   PORT=8080
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   S3_BUCKET_NAME=accounting-app-uploads-[YOUR-UNIQUE-SUFFIX]
   AWS_REGION=us-east-1
   ```

3. **Test locally first**:
   ```cmd
   npm install
   npm start
   ```
   Should show: "🚀 Server running on port 8080"

## Step 5: Deploy to Elastic Beanstalk (Manual Method)

1. **Create application.zip**:
   - Zip all files in the `backend` folder
   - Make sure `package.json` is in the root of the zip
   - Name it `application.zip`

2. **Create Elastic Beanstalk Application via AWS Console**:
   - Go to AWS Console → Elastic Beanstalk
   - Click "Create Application"
   - Application name: `accounting-backend`
   - Platform: `Node.js`
   - Platform version: Latest
   - Application code: Upload `application.zip`
   - Configuration presets: `Single instance (free tier eligible)`

3. **Configure Environment Variables**:
   After deployment, go to:
   - Configuration → Software → Environment properties
   - Add:
     - `JWT_SECRET`: your-super-secret-jwt-key
     - `S3_BUCKET_NAME`: your-bucket-name
     - `NODE_ENV`: production

## Step 6: Get Your Backend URL

After deployment completes:
- Your backend URL will be: `http://your-app-name.us-east-1.elasticbeanstalk.com`
- Test it: `http://your-app-name.us-east-1.elasticbeanstalk.com/health`

## Step 7: Update Frontend

Update your `.env` file:
```env
VITE_API_URL=http://your-app-name.us-east-1.elasticbeanstalk.com/api
```

That's it! Your backend will be live and connected to your frontend.