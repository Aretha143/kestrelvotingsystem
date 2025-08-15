const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database');
const { router: authRoutes } = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const simpleStaffRoutes = require('./routes/simple-staff');
const campaignRoutes = require('./routes/campaigns');
const voteRoutes = require('./routes/votes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (needed for Render)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://kestrelvotingsystem.onrender.com',
        'https://kestrelvotingsystem-1.onrender.com',
        'https://kestrelvotingsystem.onrender.com'
      ] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/simple-staff', simpleStaffRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/votes', voteRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  // Check if build directory exists
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    // If no build files, serve API only
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Kestrel Nest Garden Voting System API',
        status: 'running',
        endpoints: {
          auth: '/api/auth',
          staff: '/api/staff',
          campaigns: '/api/campaigns',
          votes: '/api/votes'
        }
      });
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Kestrel Nest Garden Voting System`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
