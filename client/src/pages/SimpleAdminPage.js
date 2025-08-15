import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  LogOut, 
  Plus,
  Trash2,
  UserPlus
} from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import SimpleStaffModal from '../components/SimpleStaffModal';

const SimpleAdminPage = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Fetch all staff
  const { data: staff, isLoading } = useQuery('simpleStaff', async () => {
    const response = await axios.get('/simple-staff/list');
    return response.data.data;
  });

  // Simple staff creation mutation
  const createStaffMutation = useMutation(
    async (staffData) => {
      console.log('Creating simple staff with data:', staffData);
      const response = await axios.post('/simple-staff/create', staffData);
      console.log('Simple staff creation response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Simple staff created successfully!');
        toast.success(`Staff member created! ID: ${data.data.staffId}, PRN: ${data.data.prn}`);
        queryClient.invalidateQueries('simpleStaff');
        setShowStaffModal(false);
      },
      onError: (error) => {
        console.error('Simple staff creation error:', error);
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      },
    }
  );

  // Delete staff mutation
  const deleteStaffMutation = useMutation(
    async (id) => {
      const response = await axios.delete(`/simple-staff/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Staff member deleted successfully!');
        queryClient.invalidateQueries('simpleStaff');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete staff member');
      },
    }
  );

  const handleLogout = () => {
    logout();
  };

  const handleCreateStaff = () => {
    setShowStaffModal(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-kestrel-500 to-kestrel-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Simple Staff Management</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Staff Members</h2>
              <p className="text-gray-600">Manage staff members for voting system</p>
            </div>
            <button
              onClick={handleCreateStaff}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>

          {/* Staff List */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Current Staff</h3>
            </div>
            
            <div className="card-body">
              {staff && staff.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
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
                      {staff.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.staff_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${member.is_active ? 'badge-success' : 'badge-error'}`}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => deleteStaffMutation.mutate(member.id)}
                              className="btn-ghost p-1 text-gray-400 hover:text-error-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first staff member.</p>
                  <button
                    onClick={handleCreateStaff}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add First Staff</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Simple Staff Modal */}
      {showStaffModal && (
        <SimpleStaffModal
          onClose={() => setShowStaffModal(false)}
          onSubmit={createStaffMutation.mutate}
          loading={createStaffMutation.isLoading}
        />
      )}
    </div>
  );
};

export default SimpleAdminPage;
