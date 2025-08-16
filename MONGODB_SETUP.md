# MongoDB Atlas Setup Guide

## Current Status

Your application is currently using **SQLite** for immediate functionality. This works well for development and testing, but data will be lost when Render.com restarts your service.

## Future MongoDB Atlas Migration

When you're ready to migrate to MongoDB Atlas for persistent data storage, follow these steps:

### 1. Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Set up database access and network access
4. Get your connection string

### 2. Update Your Application
The application code has been prepared for MongoDB migration. You'll need to:
1. Set the `MONGODB_URI` environment variable in Render.com
2. The application will automatically switch to MongoDB when properly configured

### 3. Connection String Format
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/voting-system?retryWrites=true&w=majority
```

## Current SQLite Setup

Your application is working with SQLite in `/tmp/voting.db` on Render.com. This provides:
- ✅ Immediate functionality
- ✅ Sample data included
- ✅ Admin login: `admin` / `KestrelNestGarden@@#$`
- ❌ Data loss on service restart

## When to Migrate to MongoDB

Consider migrating to MongoDB Atlas when:
- You need persistent data storage
- You have multiple users
- You want to avoid data loss on deployments
- You're ready for production use

For now, your voting system is fully functional with SQLite! 🎉
