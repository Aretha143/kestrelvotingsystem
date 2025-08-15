const express = require('express');
const { getDatabase } = require('../database');
const { verifyToken, verifyAdmin } = require('./auth');

const router = express.Router();

// Get all campaigns
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM campaigns ORDER BY created_at DESC',
    (err, campaigns) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: campaigns
      });
    }
  );
});

// Get active campaigns
router.get('/active', verifyToken, (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM campaigns WHERE is_active = 1 AND is_published = 1 AND datetime("now") BETWEEN start_date AND end_date ORDER BY created_at DESC',
    (err, campaigns) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: campaigns
      });
    }
  );
});

// Get campaign by ID
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get(
    'SELECT * FROM campaigns WHERE id = ?',
    [id],
    (err, campaign) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    }
  );
});

// Create new campaign (admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Title, start date, and end date are required'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start <= now) {
    return res.status(400).json({
      success: false,
      message: 'Start date must be in the future'
    });
  }

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  const db = getDatabase();
  
  db.run(
    'INSERT INTO campaigns (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
    [title, description || null, startDate, endDate],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: {
          id: this.lastID,
          title,
          description,
          startDate,
          endDate
        }
      });
    }
  );
});

// Update campaign (admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, is_active } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Title, start date, and end date are required'
    });
  }

  const db = getDatabase();
  
  db.run(
    'UPDATE campaigns SET title = ?, description = ?, start_date = ?, end_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description || null, startDate, endDate, is_active !== undefined ? is_active : 1, id],
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
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: 'Campaign updated successfully'
      });
    }
  );
});

// Publish/unpublish campaign (admin only)
router.post('/:id/publish', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;
  const db = getDatabase();
  
  db.run(
    'UPDATE campaigns SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [isPublished ? 1 : 0, id],
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
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: `Campaign ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    }
  );
});

// Delete campaign (admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  // Check if campaign has any votes
  db.get(
    'SELECT COUNT(*) as voteCount FROM votes WHERE campaign_id = ?',
    [id],
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
          message: 'Cannot delete campaign with existing votes. Deactivate instead.'
        });
      }

      db.run(
        'DELETE FROM campaigns WHERE id = ?',
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
              message: 'Campaign not found'
            });
          }

          res.json({
            success: true,
            message: 'Campaign deleted successfully'
          });
        }
      );
    }
  );
});

// Get campaign statistics (admin only)
router.get('/:id/stats', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get(
    `SELECT 
      c.*,
      COUNT(v.id) as totalVotes,
      COUNT(DISTINCT v.voter_staff_id) as uniqueVoters,
      COUNT(DISTINCT v.candidate_staff_id) as candidates
    FROM campaigns c
    LEFT JOIN votes v ON c.id = v.campaign_id
    WHERE c.id = ?
    GROUP BY c.id`,
    [id],
    (err, stats) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: stats
      });
    }
  );
});

// Get campaign results (admin only)
router.get('/:id/results', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.all(
    `SELECT 
      s.name,
      s.position,
      s.department,
      COUNT(v.id) as voteCount,
      GROUP_CONCAT(v.reason, '|') as reasons
    FROM staff s
    LEFT JOIN votes v ON s.staff_id = v.candidate_staff_id AND v.campaign_id = ?
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY voteCount DESC, s.name`,
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      // Process reasons
      const processedResults = results.map(result => ({
        ...result,
        reasons: result.reasons ? result.reasons.split('|') : []
      }));

      res.json({
        success: true,
        data: processedResults
      });
    }
  );
});

module.exports = router;
