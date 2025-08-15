# Deployment Guide - Free Hosting Options

## Option 1: Render (Recommended - Easiest)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure your repository is public (for free tier)

### Step 2: Deploy Backend on Render
1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `kestrel-voting-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   FRONTEND_URL=https://your-app-name.onrender.com
   ```

6. Click "Create Web Service"

### Step 3: Deploy Frontend on Render
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `kestrel-voting-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com/api
   ```

### Step 4: Update CORS Settings
Update your backend URL in the frontend environment variable.

---

## Option 2: Railway (Alternative)

### Step 1: Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will auto-detect it's a Node.js app
4. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secure-jwt-secret
   ```

### Step 2: Deploy Frontend
1. Create a new service for the frontend
2. Set build command: `cd client && npm install && npm run build`
3. Set static files directory: `client/build`

---

## Option 3: Vercel (Frontend Only)

### Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

---

## Option 4: Netlify (Frontend Only)

### Deploy Frontend on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`

4. Add Environment Variables in Site Settings → Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

---

## Important Notes

### Database Considerations
- **SQLite**: Your current setup uses SQLite, which works for small applications
- **Limitations**: SQLite files are not persistent on most free hosting platforms
- **Solutions**:
  1. Use a free database service (MongoDB Atlas, Supabase, etc.)
  2. Accept that data will reset periodically on free tiers
  3. Upgrade to paid plans for persistent storage

### Environment Variables
Make sure to set these in your hosting platform:
```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key
FRONTEND_URL=https://your-frontend-url.com
```

### CORS Configuration
Update the CORS origin in `server/index.js` to match your frontend URL.

### SSL/HTTPS
All recommended platforms provide free SSL certificates automatically.

---

## Quick Start with Render (Step-by-Step)

1. **Fork/Clone your repository to GitHub**
2. **Deploy Backend**:
   - Go to render.com
   - New Web Service → Connect GitHub repo
   - Build: `npm install`
   - Start: `node server/index.js`
   - Add environment variables
3. **Deploy Frontend**:
   - New Static Site → Same GitHub repo
   - Build: `cd client && npm install && npm run build`
   - Publish: `client/build`
   - Add `REACT_APP_API_URL` environment variable
4. **Update URLs** in environment variables
5. **Test your application**

Your voting system will be live at your frontend URL!
