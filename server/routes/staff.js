const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, isUsingMongoDB } = require('../database');
const { verifyToken, verifyAdmin } = require('./auth');

const router = express.Router();

// Get all staff members (admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      const staff = await staffCollection.find({}).sort({ name: 1 }).toArray();
      
      // Transform MongoDB documents to match expected format
      const transformedStaff = staff.map(doc => ({
        id: doc._id.toString(),
        staff_id: doc.staff_id,
        name: doc.name,
        position: doc.position,
        department: doc.department,
        email: doc.email,
        phone: doc.phone,
        is_active: doc.is_active,
        created_at: doc.created_at
      }));

      res.json({
        success: true,
        data: transformedStaff
      });
    } else {
      // SQLite approach
      db.all(
        'SELECT id, staff_id, name, position, department, email, phone, is_active, created_at FROM staff ORDER BY name',
        (err, staff) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          res.json({
            success: true,
            data: staff
          });
        }
      );
    }
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get active staff members for voting (staff only)
router.get('/voting', verifyToken, (req, res) => {
  const db = getDatabase();
  
  // Exclude the current user from the voting candidates
  db.all(
    'SELECT id, staff_id, name, position, department FROM staff WHERE is_active = 1 AND staff_id != ? ORDER BY name',
    [req.user.staffId],
    (err, staff) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: staff
      });
    }
  );
});

// Get staff by ID
router.get('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.get(
    'SELECT id, staff_id, name, position, department, email, phone, is_active, created_at FROM staff WHERE id = ?',
    [id],
    (err, staff) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        data: staff
      });
    }
  );
});

// Create new staff member (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { staff_id, pin, name, position, department, email, phone } = req.body;

    if (!staff_id || !pin || !name || !position || !department) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID, PIN, name, position, and department are required'
      });
    }

    // Validate PIN format
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 digits'
      });
    }

    const db = getDatabase();

    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      
      // Check if staff ID already exists
      const existingStaff = await staffCollection.findOne({ staff_id: staff_id });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID already exists. Please choose a different ID.'
        });
      }

      // Create new staff member
      const newStaff = {
        staff_id,
        pin,
        name,
        position,
        department,
        email: email || null,
        phone: phone || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await staffCollection.insertOne(newStaff);

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: {
          id: result.insertedId.toString(),
          staffId: staff_id,
          pin,
          name,
          position,
          department,
          email,
          phone
        }
      });
    } else {
      // SQLite approach
      db.run(
        'INSERT INTO staff (staff_id, pin, name, position, department, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [staff_id, pin, name, position, department, email || null, phone || null],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({
                success: false,
                message: 'Staff ID already exists. Please choose a different ID.'
              });
            }
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          res.status(201).json({
            success: true,
            message: 'Staff member created successfully',
            data: {
              id: this.lastID,
              staffId: staff_id,
              pin,
              name,
              position,
              department,
              email,
              phone
            }
          });
        }
      );
    }
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Update staff member (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, department, email, phone, is_active } = req.body;

    if (!name || !position || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, position, and department are required'
      });
    }

    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      const { ObjectId } = require('mongodb');
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff ID format'
        });
      }

      const updateData = {
        name,
        position,
        department,
        email: email || null,
        phone: phone || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date()
      };

      const result = await staffCollection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        message: 'Staff member updated successfully'
      });
    } else {
      // SQLite approach
      db.run(
        'UPDATE staff SET name = ?, position = ?, department = ?, email = ?, phone = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, position, department, email || null, phone || null, is_active !== undefined ? is_active : 1, id],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              success: false,
              message: 'Staff member not found'
            });
          }

          res.json({
            success: true,
            message: 'Staff member updated successfully'
          });
        }
      );
    }
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Reset staff PIN (admin only)
router.post('/:id/reset-pin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const newPin = Math.floor(Math.random() * 9000) + 1000; // Generate 4-digit PIN

    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      const { ObjectId } = require('mongodb');
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff ID format'
        });
      }

      const result = await staffCollection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            pin: newPin.toString(),
            updated_at: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        message: 'PIN reset successfully',
        data: {
          newPin
        }
      });
    } else {
      // SQLite approach
      db.run(
        'UPDATE staff SET pin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPin.toString(), id],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              success: false,
              message: 'Staff member not found'
            });
          }

          res.json({
            success: true,
            message: 'PIN reset successfully',
            data: {
              newPin
            }
          });
        }
      );
    }
  } catch (error) {
    console.error('Error resetting PIN:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Delete staff member (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      const votesCollection = db.collection('votes');
      const { ObjectId } = require('mongodb');
      
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff ID format'
        });
      }

      // Get staff member to check their staff_id
      const staffMember = await staffCollection.findOne({ _id: objectId });
      if (!staffMember) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Check if staff has any votes
      const voteCount = await votesCollection.countDocuments({
        $or: [
          { voter_staff_id: staffMember.staff_id },
          { candidate_staff_id: staffMember.staff_id }
        ]
      });

      if (voteCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete staff member with existing votes. Deactivate instead.'
        });
      }

      // Delete staff member
      const result = await staffCollection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        message: 'Staff member deleted successfully'
      });
    } else {
      // SQLite approach
      // Check if staff has any votes
      db.get(
        'SELECT COUNT(*) as voteCount FROM votes WHERE voter_staff_id = (SELECT staff_id FROM staff WHERE id = ?) OR candidate_staff_id = (SELECT staff_id FROM staff WHERE id = ?)',
        [id, id],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (result.voteCount > 0) {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete staff member with existing votes. Deactivate instead.'
            });
          }

          db.run(
            'DELETE FROM staff WHERE id = ?',
            [id],
            function(err) {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: 'Database error'
                });
              }

              if (this.changes === 0) {
                return res.status(404).json({
                  success: false,
                  message: 'Staff member not found'
                });
              }

              res.json({
                success: true,
                message: 'Staff member deleted successfully'
              });
            }
          );
        }
      );
    }
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get staff statistics (admin only)
router.get('/stats/overview', verifyToken, verifyAdmin, (req, res) => {
  const db = getDatabase();
  
  db.get(
    `SELECT 
      COUNT(*) as totalStaff,
      COUNT(CASE WHEN is_active = 1 THEN 1 END) as activeStaff,
      COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactiveStaff,
      COUNT(DISTINCT department) as departments
    FROM staff`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: stats
      });
    }
  );
});

// Get staff by department
router.get('/department/:department', verifyToken, (req, res) => {
  const { department } = req.params;
  const db = getDatabase();
  
  db.all(
    'SELECT id, staff_id, name, position, department, email, phone, is_active FROM staff WHERE department = ? AND is_active = 1 ORDER BY name',
    [department],
    (err, staff) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: staff
      });
    }
  );
});

module.exports = router;
