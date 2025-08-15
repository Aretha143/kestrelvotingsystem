const express = require('express');
const { getDatabase } = require('../database');
const { verifyToken, verifyAdmin } = require('./auth');

const router = express.Router();

// Simple staff creation - only requires id, prn, and name
router.post('/create', verifyToken, verifyAdmin, (req, res) => {
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
});

// Get all staff (simple list)
router.get('/list', verifyToken, verifyAdmin, (req, res) => {
  const db = getDatabase();
  
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
});

// Delete staff member
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

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
});

module.exports = router;
