# MongoDB Atlas Setup Guide

## Current Status

Your application now supports **both MongoDB Atlas and SQLite**! It will automatically use MongoDB Atlas when properly configured, or fall back to SQLite for immediate functionality.

### Recent Updates (Latest Deployment)
- ✅ **Fixed SSL/TLS Connection Issues**: Removed deprecated `sslValidate` option
- ✅ **Enhanced Connection Strategies**: Multiple TLS configuration fallbacks
- ✅ **Modern MongoDB Driver**: Updated to use current best practices
- ✅ **Improved Error Handling**: Better retry logic and connection diagnostics

## Quick Setup for MongoDB Atlas

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Get Started Free"
3. Create an account or sign in with Google/GitHub

### Step 2: Create a New Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your users (recommended: us-east-1, us-west-2, or eu-west-1)
5. Click "Create"

### Step 3: Set Up Database Access
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Your Connection String
1. In the left sidebar, click "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "5.0 or later"
5. Copy the connection string

### Step 6: Update Your Connection String
Replace the placeholders in your connection string:
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Replace `<dbname>` with your database name (e.g., `voting-system`)

**Final connection string should look like:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/voting-system?retryWrites=true&w=majority
```

### Step 7: Set Environment Variable on Render
1. Go to your Render.com dashboard
2. Select your voting backend service
3. Go to "Environment" tab
4. Add a new environment variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your complete connection string from Step 6
5. Click "Save Changes"
6. Redeploy your service

### Step 8: Test Your Connection
1. After redeployment, check your Render logs
2. You should see: "✅ Connected to MongoDB Atlas"
3. If you see errors, the app will automatically fall back to SQLite

## How It Works

### Automatic Database Selection
- **If MONGODB_URI is set**: Uses MongoDB Atlas
- **If MONGODB_URI is not set**: Falls back to SQLite
- **If MongoDB connection fails**: Automatically falls back to SQLite

### Benefits
- ✅ **Persistent Data**: MongoDB Atlas keeps your data safe
- ✅ **Automatic Fallback**: App works even if MongoDB is down
- ✅ **No Data Loss**: Seamless transition between databases
- ✅ **Free Tier**: MongoDB Atlas offers generous free tier

## Troubleshooting

### Common Issues:

1. **SSL/TLS Connection Errors**
   - The application includes modern TLS configuration with multiple fallback strategies
   - Updated to use `tlsAllowInvalidCertificates` instead of deprecated `sslValidate`
   - Automatically tries different TLS configurations if the initial connection fails
   - Try different regions if issues persist
   - Check network access settings

2. **Connection Timeout**
   - Check if your IP is whitelisted in Network Access
   - Verify your connection string is correct
   - The application includes retry logic

3. **Authentication Failed**
   - Double-check username and password
   - Ensure the user has proper permissions
   - Make sure there are no special characters in the password that need URL encoding

4. **Database Not Found**
   - Make sure you specified the database name in the connection string
   - The database will be created automatically when you first insert data

### Getting Help:
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Community: https://community.mongodb.com/
- Render.com Support: https://render.com/docs/help

## Cost Considerations

### MongoDB Atlas Free Tier:
- 512MB storage
- Shared RAM
- Up to 500 connections
- Perfect for small to medium applications

### When to Upgrade:
- More than 512MB of data
- High traffic (many concurrent users)
- Need dedicated resources
- Require advanced features (backups, monitoring, etc.)

## Next Steps

1. **Set up MongoDB Atlas** following the steps above
2. **Test your application** - it should work with both databases
3. **Monitor your database usage** in Atlas dashboard
4. **Set up alerts** for storage and connection limits
5. **Consider setting up automated backups**

Your voting system is now ready with persistent, cloud-hosted database storage! 🎉
