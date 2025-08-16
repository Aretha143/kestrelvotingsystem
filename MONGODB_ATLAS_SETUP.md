# MongoDB Atlas Setup Guide - Solve Data Reset Issue

## 🎯 **Goal: Persistent Database for Your Voting System**

Your SQLite database resets on Render restarts. MongoDB Atlas will solve this by providing persistent cloud storage.

## 📋 **Step-by-Step Setup**

### **Step 1: Create MongoDB Atlas Account**

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Click "Try Free"** or "Get Started Free"
3. **Sign up** with Google, GitHub, or email
4. **Choose "FREE" tier** (M0 - Shared)

### **Step 2: Create Your Database Cluster**

1. **Click "Build a Database"**
2. **Choose "FREE" tier** (M0)
3. **Select Cloud Provider**: AWS, Google Cloud, or Azure
4. **Choose Region**: Pick closest to your users
   - **Recommended**: `us-east-1` (N. Virginia) or `us-west-2` (Oregon)
5. **Click "Create"**

### **Step 3: Set Up Database Access**

1. **In left sidebar, click "Database Access"**
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `voting-admin` (or any username)
5. **Password**: Create a strong password (save this!)
6. **Database User Privileges**: "Read and write to any database"
7. **Click "Add User"**

### **Step 4: Set Up Network Access**

1. **In left sidebar, click "Network Access"**
2. **Click "Add IP Address"**
3. **Click "Allow Access from Anywhere"** (0.0.0.0/0)
4. **Click "Confirm"**

### **Step 5: Get Your Connection String**

1. **In left sidebar, click "Database"**
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Select "Node.js"** and version "5.0 or later"
5. **Copy the connection string**

### **Step 6: Update Your Connection String**

Replace the placeholders in your connection string:

**Original:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Updated (example):**
```
mongodb+srv://voting-admin:YourPassword123@cluster0.xxxxx.mongodb.net/voting-system?retryWrites=true&w=majority
```

**Important:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/voting-system` after `.net` (this is your database name)

### **Step 7: Add to Render Environment Variables**

1. **Go to your Render.com dashboard**
2. **Select your voting backend service**
3. **Go to "Environment" tab**
4. **Add new environment variable:**
   - **Key**: `MONGODB_URI`
   - **Value**: Your complete connection string from Step 6
5. **Click "Save Changes"**

### **Step 8: Redeploy Your Service**

1. **In Render dashboard, click "Manual Deploy"**
2. **Choose "Deploy latest commit"**
3. **Wait for deployment to complete**

## 🔍 **Verify It's Working**

After deployment, check your Render logs. You should see:

```
✅ Connected to MongoDB Atlas
✅ MongoDB database initialized successfully
```

Instead of:
```
🔄 Initializing SQLite database...
✅ SQLite database initialized successfully
```

## 🎉 **Benefits You'll Get**

- ✅ **Persistent data** - Survives restarts and deployments
- ✅ **No data loss** - Your voting data stays safe
- ✅ **Professional database** - Cloud-hosted and managed
- ✅ **Free tier** - 512MB storage, 500 connections
- ✅ **Automatic backups** - Data protection

## 🚨 **Important Notes**

### **Free Tier Limits:**
- **Storage**: 512MB
- **Connections**: 500 concurrent
- **Perfect for small to medium applications**

### **Security:**
- **Strong password** - Use a complex password
- **Network access** - Only allow necessary IPs
- **Regular updates** - Keep credentials secure

## 🔧 **Troubleshooting**

### **If Connection Fails:**
1. **Check username/password** - Verify credentials
2. **Check network access** - Ensure 0.0.0.0/0 is allowed
3. **Check connection string** - Verify format and database name
4. **Check Render logs** - Look for specific error messages

### **If You See SQLite Fallback:**
- MongoDB connection failed
- Check your MONGODB_URI environment variable
- Verify your connection string format

## 🎯 **Next Steps**

1. **Follow the steps above**
2. **Test your application**
3. **Create some test data**
4. **Restart your Render service**
5. **Verify data persists**

Your voting system will have **permanent, persistent storage**! 🎉
