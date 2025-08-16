const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, isUsingMongoDB } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kestrel-nest-secret-key';

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const adminsCollection = db.collection('admins');
      
      const admin = await adminsCollection.findOne({ 
        username: username, 
        is_active: true 
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { 
          id: admin._id.toString(), 
          username: admin.username, 
          role: 'admin' 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
          role: 'admin'
        }
      });
    } else {
      // SQLite approach
      db.get(
        'SELECT * FROM admins WHERE username = ? AND is_active = 1',
        [username],
        async (err, admin) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (!admin) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          const isValidPassword = await bcrypt.compare(password, admin.password_hash);
          
          if (!isValidPassword) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          const token = jwt.sign(
            { 
              id: admin.id, 
              username: admin.username, 
              role: 'admin' 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: {
              id: admin.id,
              username: admin.username,
              email: admin.email,
              role: 'admin'
            }
          });
        }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Staff login
router.post('/staff/login', async (req, res) => {
  try {
    const { staffId, pin } = req.body;

    if (!staffId || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID and PIN are required'
      });
    }

    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      
      const staff = await staffCollection.findOne({ 
        staff_id: staffId, 
        pin: pin, 
        is_active: true 
      });

      if (!staff) {
        return res.status(401).json({
          success: false,
          message: 'Invalid staff ID or PIN'
        });
      }

      const token = jwt.sign(
        { 
          id: staff._id.toString(), 
          staffId: staff.staff_id, 
          name: staff.name,
          role: 'staff' 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Staff login successful',
        token,
        user: {
          id: staff._id.toString(),
          staffId: staff.staff_id,
          name: staff.name,
          position: staff.position,
          department: staff.department,
          email: staff.email,
          role: 'staff'
        }
      });
    } else {
      // SQLite approach
      db.get(
        'SELECT * FROM staff WHERE staff_id = ? AND pin = ? AND is_active = 1',
        [staffId, pin],
        (err, staff) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (!staff) {
            return res.status(401).json({
              success: false,
              message: 'Invalid staff ID or PIN'
            });
          }

          const token = jwt.sign(
            { 
              id: staff.id, 
              staffId: staff.staff_id, 
              name: staff.name,
              role: 'staff' 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.json({
            success: true,
            message: 'Staff login successful',
            token,
            user: {
              id: staff.id,
              staffId: staff.staff_id,
              name: staff.name,
              position: staff.position,
              department: staff.department,
              email: staff.email,
              role: 'staff'
            }
          });
        }
      );
    }
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Verify admin middleware
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Verify staff middleware
const verifyStaff = (req, res, next) => {
  if (req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
  next();
};

// Get current user info
router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = {
  router,
  verifyToken,
  verifyAdmin,
  verifyStaff
};
