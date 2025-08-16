const express = require('express');
const { getDatabase, isUsingMongoDB } = require('../database');
const { verifyToken, verifyStaff } = require('./auth');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Cast a vote (staff only)
router.post('/', verifyToken, verifyStaff, async (req, res) => {
  try {
    const { campaignId, candidateStaffId, reason } = req.body;
    const voterStaffId = req.user.staffId;

    if (!campaignId || !candidateStaffId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID, candidate staff ID, and reason are required'
      });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be at least 10 characters long'
      });
    }

    if (voterStaffId === candidateStaffId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote for yourself'
      });
    }

    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const campaignsCollection = db.collection('campaigns');
      const staffCollection = db.collection('staff');
      const votesCollection = db.collection('votes');
      
      // Check if campaign is active and published
      const campaign = await campaignsCollection.findOne({
        _id: new ObjectId(campaignId),
        is_active: true,
        is_published: true,
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() }
      });

      if (!campaign) {
        return res.status(400).json({
          success: false,
          message: 'Campaign is not active or not found'
        });
      }

      // Check if candidate exists and is active
      const candidate = await staffCollection.findOne({
        staff_id: candidateStaffId,
        is_active: true
      });

      if (!candidate) {
        return res.status(400).json({
          success: false,
          message: 'Candidate not found or inactive'
        });
      }

      // Check if voter has already voted in this campaign
      const existingVote = await votesCollection.findOne({
        campaign_id: new ObjectId(campaignId),
        voter_staff_id: voterStaffId
      });

      if (existingVote) {
        return res.status(400).json({
          success: false,
          message: 'You have already voted in this campaign'
        });
      }

      // Insert the vote
      const newVote = {
        campaign_id: new ObjectId(campaignId),
        voter_staff_id: voterStaffId,
        candidate_staff_id: candidateStaffId,
        reason: reason.trim(),
        created_at: new Date()
      };

      const result = await votesCollection.insertOne(newVote);

      res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: {
          id: result.insertedId.toString(),
          campaignId,
          candidateStaffId,
          reason: reason.trim()
        }
      });
    } else {
      // SQLite approach
      // Check if campaign is active and published
      db.get(
        'SELECT * FROM campaigns WHERE id = ? AND is_active = 1 AND is_published = 1 AND datetime("now") BETWEEN start_date AND end_date',
        [campaignId],
        (err, campaign) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (!campaign) {
            return res.status(400).json({
              success: false,
              message: 'Campaign is not active or not found'
            });
          }

          // Check if candidate exists and is active
          db.get(
            'SELECT * FROM staff WHERE staff_id = ? AND is_active = 1',
            [candidateStaffId],
            (err, candidate) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: 'Database error'
                });
              }

              if (!candidate) {
                return res.status(400).json({
                  success: false,
                  message: 'Candidate not found or inactive'
                });
              }

              // Check if voter has already voted in this campaign
              db.get(
                'SELECT * FROM votes WHERE campaign_id = ? AND voter_staff_id = ?',
                [campaignId, voterStaffId],
                (err, existingVote) => {
                  if (err) {
                    return res.status(500).json({
                      success: false,
                      message: 'Database error'
                    });
                  }

                  if (existingVote) {
                    return res.status(400).json({
                      success: false,
                      message: 'You have already voted in this campaign'
                    });
                  }

                  // Insert the vote
                  db.run(
                    'INSERT INTO votes (campaign_id, voter_staff_id, candidate_staff_id, reason) VALUES (?, ?, ?, ?)',
                    [campaignId, voterStaffId, candidateStaffId, reason.trim()],
                    function(err) {
                      if (err) {
                        return res.status(500).json({
                          success: false,
                          message: 'Database error'
                        });
                      }

                      res.status(201).json({
                        success: true,
                        message: 'Vote cast successfully',
                        data: {
                          id: this.lastID,
                          campaignId,
                          candidateStaffId,
                          reason: reason.trim()
                        }
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get user's vote for a campaign (staff only)
router.get('/my-vote/:campaignId', verifyToken, verifyStaff, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const voterStaffId = req.user.staffId;
    const db = getDatabase();
    
    if (isUsingMongoDB()) {
      // MongoDB approach
      const votesCollection = db.collection('votes');
      const campaignsCollection = db.collection('campaigns');
      const staffCollection = db.collection('staff');
      
      const vote = await votesCollection.findOne({
        campaign_id: new ObjectId(campaignId),
        voter_staff_id: voterStaffId
      });
      
      if (!vote) {
        return res.json({
          success: true,
          data: null
        });
      }
      
      // Get campaign and candidate details
      const [campaign, candidate] = await Promise.all([
        campaignsCollection.findOne({ _id: new ObjectId(campaignId) }),
        staffCollection.findOne({ staff_id: vote.candidate_staff_id })
      ]);
      
      const voteData = {
        id: vote._id.toString(),
        campaign_id: vote.campaign_id.toString(),
        voter_staff_id: vote.voter_staff_id,
        candidate_staff_id: vote.candidate_staff_id,
        reason: vote.reason,
        created_at: vote.created_at,
        campaign_title: campaign?.title,
        candidate_name: candidate?.name,
        candidate_position: candidate?.position,
        candidate_department: candidate?.department
      };

      res.json({
        success: true,
        data: voteData
      });
    } else {
      // SQLite approach
      db.get(
        `SELECT 
          v.*,
          c.title as campaign_title,
          s.name as candidate_name,
          s.position as candidate_position,
          s.department as candidate_department
        FROM votes v
        JOIN campaigns c ON v.campaign_id = c.id
        JOIN staff s ON v.candidate_staff_id = s.staff_id
        WHERE v.campaign_id = ? AND v.voter_staff_id = ?`,
        [campaignId, voterStaffId],
        (err, vote) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          res.json({
            success: true,
            data: vote
          });
        }
      );
    }
  } catch (error) {
    console.error('Error fetching user vote:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get campaign results (for published campaigns)
router.get('/results/:campaignId', verifyToken, (req, res) => {
  const { campaignId } = req.params;
  const db = getDatabase();

  // Check if campaign is published and ended
  db.get(
    'SELECT * FROM campaigns WHERE id = ? AND is_published = 1 AND datetime("now") > end_date',
    [campaignId],
    (err, campaign) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!campaign) {
        return res.status(400).json({
          success: false,
          message: 'Campaign results are not yet available'
        });
      }

      // Get voting results
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
        [campaignId],
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
            data: {
              campaign,
              results: processedResults
            }
          });
        }
      );
    }
  );
});

// Get voting statistics for a campaign
router.get('/stats/:campaignId', verifyToken, (req, res) => {
  const { campaignId } = req.params;
  const db = getDatabase();

  db.get(
    `SELECT 
      COUNT(v.id) as totalVotes,
      COUNT(DISTINCT v.voter_staff_id) as uniqueVoters,
      COUNT(DISTINCT v.candidate_staff_id) as candidates,
      (SELECT COUNT(*) FROM staff WHERE is_active = 1) as totalStaff
    FROM votes v
    WHERE v.campaign_id = ?`,
    [campaignId],
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

// Get all votes for a campaign (admin only)
router.get('/campaign/:campaignId', verifyToken, (req, res) => {
  const { campaignId } = req.params;
  const db = getDatabase();

  db.all(
    `SELECT 
      v.*,
      voter.name as voter_name,
      voter.position as voter_position,
      voter.department as voter_department,
      candidate.name as candidate_name,
      candidate.position as candidate_position,
      candidate.department as candidate_department
    FROM votes v
    JOIN staff voter ON v.voter_staff_id = voter.staff_id
    JOIN staff candidate ON v.candidate_staff_id = candidate.staff_id
    WHERE v.campaign_id = ?
    ORDER BY v.created_at DESC`,
    [campaignId],
    (err, votes) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: votes
      });
    }
  );
});

// Update vote (staff only - within time limit)
router.put('/:voteId', verifyToken, verifyStaff, (req, res) => {
  const { voteId } = req.params;
  const { candidateStaffId, reason } = req.body;
  const voterStaffId = req.user.staffId;

  if (!candidateStaffId || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Candidate staff ID and reason are required'
    });
  }

  if (reason.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Reason must be at least 10 characters long'
    });
  }

  const db = getDatabase();

  // Check if vote exists and belongs to user
  db.get(
    'SELECT * FROM votes WHERE id = ? AND voter_staff_id = ?',
    [voteId, voterStaffId],
    (err, vote) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!vote) {
        return res.status(404).json({
          success: false,
          message: 'Vote not found or not authorized'
        });
      }

      // Check if campaign is still active
      db.get(
        'SELECT * FROM campaigns WHERE id = ? AND is_active = 1 AND is_published = 1 AND datetime("now") BETWEEN start_date AND end_date',
        [vote.campaign_id],
        (err, campaign) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (!campaign) {
            return res.status(400).json({
              success: false,
              message: 'Campaign is no longer active'
            });
          }

          // Update the vote
          db.run(
            'UPDATE votes SET candidate_staff_id = ?, reason = ? WHERE id = ?',
            [candidateStaffId, reason.trim(), voteId],
            function(err) {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: 'Database error'
                });
              }

              res.json({
                success: true,
                message: 'Vote updated successfully'
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
