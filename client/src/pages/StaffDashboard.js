import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Vote, 
  Calendar, 
  Users, 
  Award, 
  LogOut, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import VoteModal from '../components/VoteModal';
import ResultsModal from '../components/ResultsModal';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Fetch active campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery(
    'activeCampaigns',
    async () => {
      const response = await axios.get('/campaigns/active');
      return response.data.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Fetch user's votes
  const { data: userVotes, isLoading: votesLoading } = useQuery(
    'userVotes',
    async () => {
      const votes = [];
      if (campaigns) {
        for (const campaign of campaigns) {
          try {
            const response = await axios.get(`/votes/my-vote/${campaign.id}`);
            if (response.data.data) {
              votes.push(response.data.data);
            }
          } catch (error) {
            // User hasn't voted in this campaign
          }
        }
      }
      return votes;
    },
    {
      enabled: !!campaigns,
    }
  );

  // Vote mutation
  const voteMutation = useMutation(
    async (voteData) => {
      const response = await axios.post('/votes', voteData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Vote cast successfully!');
        queryClient.invalidateQueries('userVotes');
        setShowVoteModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cast vote');
      },
    }
  );

  const handleVote = (campaign) => {
    setSelectedCampaign(campaign);
    setShowVoteModal(true);
  };

  const handleViewResults = (campaign) => {
    setSelectedCampaign(campaign);
    setShowResultsModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  if (campaignsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-kestrel-500 to-kestrel-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Kestrel Nest Garden
                </h1>
                <p className="text-sm text-gray-600">Staff Voting Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.position}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost p-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-kestrel-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-kestrel-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-gray-600">
                  Cast your vote for the Staff of the Month and help recognize excellence in our team.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Campaigns */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-kestrel-600" />
            <span>Active Voting Campaigns</span>
          </h3>

          {campaigns && campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign, index) => {
                const hasVoted = userVotes?.some(vote => vote.campaign_id === campaign.id);
                const isEnded = new Date(campaign.end_date) < new Date();
                
                return (
                  <motion.div
                    key={campaign.id}
                    className="card hover:shadow-medium transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="card-header">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                        {hasVoted && (
                          <span className="badge-success flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Voted</span>
                          </span>
                        )}
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mt-2">{campaign.description}</p>
                      )}
                    </div>

                    <div className="card-body space-y-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Ends: {new Date(campaign.end_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        {!isEnded && !hasVoted && (
                          <button
                            onClick={() => handleVote(campaign)}
                            className="btn-primary flex-1 flex items-center justify-center space-x-2"
                          >
                            <Vote className="w-4 h-4" />
                            <span>Cast Vote</span>
                          </button>
                        )}
                        
                        {hasVoted && (
                          <button
                            onClick={() => handleViewResults(campaign)}
                            className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View My Vote</span>
                          </button>
                        )}
                        
                        {isEnded && (
                          <button
                            onClick={() => handleViewResults(campaign)}
                            className="btn-success flex-1 flex items-center justify-center space-x-2"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>View Results</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              className="card text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Active Campaigns
              </h3>
              <p className="text-gray-600">
                There are currently no active voting campaigns. Check back later!
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Vote Modal */}
      {showVoteModal && selectedCampaign && (
        <VoteModal
          campaign={selectedCampaign}
          onClose={() => setShowVoteModal(false)}
          onSubmit={voteMutation.mutate}
          loading={voteMutation.isLoading}
        />
      )}

      {/* Results Modal */}
      {showResultsModal && selectedCampaign && (
        <ResultsModal
          campaign={selectedCampaign}
          onClose={() => setShowResultsModal(false)}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
