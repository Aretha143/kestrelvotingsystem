import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Calendar, 
  Award, 
  LogOut, 
  Plus,
  Settings,
  BarChart3,
  UserPlus,
  Megaphone,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Download
} from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import StaffModal from '../components/StaffModal';
import CampaignModal from '../components/CampaignModal';
import ResultsModal from '../components/ResultsModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch staff statistics
  const { data: staffStats } = useQuery('staffStats', async () => {
    const response = await axios.get('/staff/stats/overview');
    return response.data.data;
  });

  // Fetch all staff
  const { data: staff, isLoading: staffLoading } = useQuery('staff', async () => {
    const response = await axios.get('/staff');
    return response.data.data;
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery('campaigns', async () => {
    const response = await axios.get('/campaigns');
    return response.data.data;
  });

  // Staff mutations
  const createStaffMutation = useMutation(
    async (staffData) => {
      console.log('Creating staff with data:', staffData);
      const response = await axios.post('/staff', staffData);
      console.log('Staff creation response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Staff created successfully!');
        toast.success(
          `Staff member created successfully! 
          Staff ID: ${data.data.staffId} 
          PIN: ${data.data.pin}
          
          Staff can now log in using these credentials.`,
          { duration: 6000 }
        );
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries('staffStats');
        setShowStaffModal(false);
      },
      onError: (error) => {
        console.error('Staff creation error:', error);
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      },
    }
  );

  const updateStaffMutation = useMutation(
    async ({ id, data }) => {
      const response = await axios.put(`/staff/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member updated successfully!');
        queryClient.invalidateQueries('staff');
        setShowStaffModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff member');
      },
    }
  );

  const deleteStaffMutation = useMutation(
    async (id) => {
      const response = await axios.delete(`/staff/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member deleted successfully!');
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries('staffStats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete staff member');
      },
    }
  );

  // Campaign mutations
  const createCampaignMutation = useMutation(
    async (campaignData) => {
      console.log('Creating campaign with data:', campaignData);
      const response = await axios.post('/campaigns', campaignData);
      console.log('Campaign creation response:', response.data);
      return response.data;
    },
    {
      onSuccess: () => {
        console.log('Campaign created successfully!');
        toast.success('Campaign created successfully!');
        queryClient.invalidateQueries('campaigns');
        setShowCampaignModal(false);
      },
      onError: (error) => {
        console.error('Campaign creation error:', error);
        toast.error(error.response?.data?.message || 'Failed to create campaign');
      },
    }
  );

  const updateCampaignMutation = useMutation(
    async ({ id, data }) => {
      const response = await axios.put(`/campaigns/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Campaign updated successfully!');
        queryClient.invalidateQueries('campaigns');
        setShowCampaignModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update campaign');
      },
    }
  );

  const publishCampaignMutation = useMutation(
    async ({ id, isPublished }) => {
      const response = await axios.post(`/campaigns/${id}/publish`, { isPublished });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries('campaigns');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update campaign status');
      },
    }
  );

  const handleLogout = () => {
    logout();
  };

  const handleCreateStaff = () => {
    console.log('handleCreateStaff called');
    console.log('Current showStaffModal state:', showStaffModal);
    setSelectedItem(null);
    setShowStaffModal(true);
    console.log('showStaffModal should be set to true');
    console.log('Button clicked successfully!');
  };

  const handleEditStaff = (staff) => {
    setSelectedItem(staff);
    setShowStaffModal(true);
  };

  const handleCreateCampaign = () => {
    setSelectedItem(null);
    setShowCampaignModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedItem(campaign);
    setShowCampaignModal(true);
  };

  const handleViewResults = (campaign) => {
    setSelectedItem(campaign);
    setShowResultsModal(true);
  };

  if (staffLoading || campaignsLoading) {
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
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'staff', label: 'Staff Management', icon: Users },
              { id: 'campaigns', label: 'Campaigns', icon: Calendar },
              { id: 'results', label: 'Results', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-kestrel-500 text-kestrel-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Staff</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats?.totalStaff || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Staff</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats?.activeStaff || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaigns?.filter(c => c.is_active && c.is_published).length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-kestrel-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-kestrel-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Departments</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats?.departments || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                onClick={handleCreateStaff}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
                  
                  <button
                    onClick={handleCreateCampaign}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Create Campaign</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('results')}
                    className="btn-secondary flex items-center justify-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Results</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
              <button
                onClick={handleCreateStaff}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff</span>
              </button>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff?.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.staff_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${member.is_active ? 'badge-success' : 'badge-error'}`}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditStaff(member)}
                              className="btn-ghost p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteStaffMutation.mutate(member.id)}
                              className="btn-ghost p-1 text-gray-400 hover:text-error-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
              <button
                onClick={handleCreateCampaign}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns?.map((campaign) => (
                <div key={campaign.id} className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                      <div className="flex space-x-1">
                        {campaign.is_published && (
                          <span className="badge-success">Published</span>
                        )}
                        {!campaign.is_active && (
                          <span className="badge-error">Inactive</span>
                        )}
                      </div>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-600 mt-2">{campaign.description}</p>
                    )}
                  </div>

                  <div className="card-body space-y-4">
                    <div className="text-sm text-gray-600">
                      <div>Start: {new Date(campaign.start_date).toLocaleDateString()}</div>
                      <div>End: {new Date(campaign.end_date).toLocaleDateString()}</div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCampaign(campaign)}
                        className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => publishCampaignMutation.mutate({
                          id: campaign.id,
                          isPublished: !campaign.is_published
                        })}
                        className={`btn flex-1 flex items-center justify-center space-x-2 ${
                          campaign.is_published ? 'btn-warning' : 'btn-success'
                        }`}
                      >
                        {campaign.is_published ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Publish</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleViewResults(campaign)}
                      className="btn-ghost w-full flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Results</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Voting Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns?.filter(c => c.is_published).map((campaign) => (
                <div key={campaign.id} className="card">
                  <div className="card-header">
                    <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="card-body">
                    <button
                      onClick={() => handleViewResults(campaign)}
                      className="btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>View Results</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Modals */}
      {console.log('Rendering modals, showStaffModal:', showStaffModal)}
      {showStaffModal && (
        <StaffModal
          staff={selectedItem}
          onClose={() => setShowStaffModal(false)}
          onSubmit={selectedItem ? updateStaffMutation.mutate : createStaffMutation.mutate}
          loading={createStaffMutation.isLoading || updateStaffMutation.isLoading}
        />
      )}

      {showCampaignModal && (
        <CampaignModal
          campaign={selectedItem}
          onClose={() => setShowCampaignModal(false)}
          onSubmit={selectedItem ? updateCampaignMutation.mutate : createCampaignMutation.mutate}
          loading={createCampaignMutation.isLoading || updateCampaignMutation.isLoading}
        />
      )}

      {showResultsModal && selectedItem && (
        <ResultsModal
          campaign={selectedItem}
          onClose={() => setShowResultsModal(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
