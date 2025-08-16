const express = require('express');
const { getDatabase, isUsingMongoDB } = require('../database');
const { verifyToken, verifyAdmin } = require('./auth');

const router = express.Router();

// Simple staff creation - only requires id, prn, and name
router.post('/create', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id, prn, name } = req.body;

    console.log('Simple staff creation request:', { id, prn, name });

    // Simple validation
    if (!id || !prn || !name) {
      return res.status(400).json({
        success: false,
        message: 'ID, PRN, and name are required'
      });
    }

    const db = getDatabase();

    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      
      // Check if staff ID already exists
      const existingStaff = await staffCollection.findOne({ staff_id: id });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID already exists'
        });
      }

      // Create new staff member
      const newStaff = {
        staff_id: id,
        pin: prn,
        name,
        position: 'Staff Member',
        department: 'General',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await staffCollection.insertOne(newStaff);

      console.log('Staff created successfully:', { id, prn, name });

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: {
          id: result.insertedId.toString(),
          staffId: id,
          prn,
          name
        }
      });
    } else {
      // SQLite approach
      // Check if staff ID already exists
      db.get(
        'SELECT staff_id FROM staff WHERE staff_id = ?',
        [id],
        (err, existingStaff) => {
          if (err) {
            console.error('Database error checking existing staff:', err);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (existingStaff) {
            return res.status(400).json({
              success: false,
              message: 'Staff ID already exists'
            });
          }

          // Insert new staff member
          db.run(
            'INSERT INTO staff (staff_id, pin, name, position, department, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [id, prn, name, 'Staff Member', 'General', 1],
            function(err) {
              if (err) {
                console.error('Database error inserting staff:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Database error'
                });
              }

              console.log('Staff created successfully:', { id, prn, name });

              res.status(201).json({
                success: true,
                message: 'Staff member created successfully',
                data: {
                  id: this.lastID,
                  staffId: id,
                  prn,
                  name
                }
              });
            }
          );
        }
      );
    }
  } catch (error) {
    console.error('Error creating simple staff:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get all staff (simple list)
router.get('/list', verifyToken, verifyAdmin, async (req, res) => {
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
        is_active: doc.is_active
      }));

      res.json({
        success: true,
        data: transformedStaff
      });
    } else {
      // SQLite approach
      db.all(
        'SELECT id, staff_id, name, is_active FROM staff ORDER BY name',
        (err, staff) => {
          if (err) {
            console.error('Database error getting staff list:', err);
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
    console.error('Error fetching simple staff list:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Delete staff member
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
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
      db.run(
        'DELETE FROM staff WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            console.error('Database error deleting staff:', err);
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
  } catch (error) {
    console.error('Error deleting simple staff:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

module.exports = router;
