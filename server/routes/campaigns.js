const express = require('express');
const { getDatabase, isUsingMongoDB } = require('../database');
const { verifyToken, verifyAdmin } = require('./auth');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Get all campaigns
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      const campaigns = await campaignsCollection.find({}).sort({ created_at: -1 }).toArray();
      
      // Transform MongoDB documents to match expected format
      const transformedCampaigns = campaigns.map(doc => ({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        start_date: doc.start_date,
        end_date: doc.end_date,
        is_active: doc.is_active,
        is_published: doc.is_published,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));

      res.json({
        success: true,
        data: transformedCampaigns
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get active campaigns
router.get('/active', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      const now = new Date();
      
      const campaigns = await campaignsCollection.find({
        is_active: true,
        is_published: true,
        start_date: { $lte: now },
        end_date: { $gte: now }
      }).sort({ created_at: -1 }).toArray();
      
      // Transform MongoDB documents to match expected format
      const transformedCampaigns = campaigns.map(doc => ({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        start_date: doc.start_date,
        end_date: doc.end_date,
        is_active: doc.is_active,
        is_published: doc.is_published,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));

      res.json({
        success: true,
        data: transformedCampaigns
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get campaign by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      
      const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Transform MongoDB document to match expected format
      const transformedCampaign = {
        id: campaign._id.toString(),
        title: campaign.title,
        description: campaign.description,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        is_active: campaign.is_active,
        is_published: campaign.is_published,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at
      };

      res.json({
        success: true,
        data: transformedCampaign
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error fetching campaign by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Create new campaign (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
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
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      
      const newCampaign = {
        title,
        description: description || null,
        start_date: start,
        end_date: end,
        is_active: true,
        is_published: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await campaignsCollection.insertOne(newCampaign);

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: {
          id: result.insertedId.toString(),
          title,
          description,
          startDate,
          endDate
        }
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Update campaign (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, is_active } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, start date, and end date are required'
      });
    }

    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      
      const updateData = {
        title,
        description: description || null,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date()
      };

      const result = await campaignsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: 'Campaign updated successfully'
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Publish/unpublish campaign (admin only)
router.post('/:id/publish', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      
      const result = await campaignsCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            is_published: isPublished, 
            updated_at: new Date() 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: `Campaign ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error publishing/unpublishing campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Delete campaign (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      const votesCollection = db.collection('votes');
      
      // Check if campaign has any votes
      const voteCount = await votesCollection.countDocuments({ 
        campaign_id: new ObjectId(id) 
      });

      if (voteCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete campaign with existing votes. Deactivate instead.'
        });
      }

      const result = await campaignsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        message: 'Campaign deleted successfully'
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get campaign statistics (admin only)
router.get('/:id/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      const votesCollection = db.collection('votes');
      
      // Get campaign
      const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Get vote statistics
      const totalVotes = await votesCollection.countDocuments({ 
        campaign_id: new ObjectId(id) 
      });
      
      const uniqueVoters = await votesCollection.distinct('voter_staff_id', { 
        campaign_id: new ObjectId(id) 
      });
      
      const candidates = await votesCollection.distinct('candidate_staff_id', { 
        campaign_id: new ObjectId(id) 
      });

      const stats = {
        id: campaign._id.toString(),
        title: campaign.title,
        description: campaign.description,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        is_active: campaign.is_active,
        is_published: campaign.is_published,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        totalVotes,
        uniqueVoters: uniqueVoters.length,
        candidates: candidates.length
      };

      res.json({
        success: true,
        data: stats
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error fetching campaign statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get campaign results (admin only)
router.get('/:id/results', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const staffCollection = db.collection('staff');
      const votesCollection = db.collection('votes');
      
      // Get all active staff
      const staff = await staffCollection.find({ is_active: true }).toArray();
      
      // Get votes for this campaign
      const votes = await votesCollection.find({ 
        campaign_id: new ObjectId(id) 
      }).toArray();
      
      // Group votes by candidate
      const voteCounts = {};
      const reasons = {};
      
      votes.forEach(vote => {
        const candidateId = vote.candidate_staff_id;
        if (!voteCounts[candidateId]) {
          voteCounts[candidateId] = 0;
          reasons[candidateId] = [];
        }
        voteCounts[candidateId]++;
        reasons[candidateId].push(vote.reason);
      });
      
      // Build results
      const results = staff.map(staffMember => ({
        name: staffMember.name,
        position: staffMember.position,
        department: staffMember.department,
        voteCount: voteCounts[staffMember.staff_id] || 0,
        reasons: reasons[staffMember.staff_id] || []
      }));
      
      // Sort by vote count descending, then by name
      results.sort((a, b) => {
        if (b.voteCount !== a.voteCount) {
          return b.voteCount - a.voteCount;
        }
        return a.name.localeCompare(b.name);
      });

      res.json({
        success: true,
        data: results
      });
    } else {
      // SQLite approach
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
    }
  } catch (error) {
    console.error('Error fetching campaign results:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

module.exports = router;
