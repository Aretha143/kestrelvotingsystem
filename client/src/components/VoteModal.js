import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { X, Vote, Users, MessageSquare } from 'lucide-react';
import axios from 'axios';

const VoteModal = ({ campaign, onClose, onSubmit, loading }) => {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch available staff for voting
  const { data: staff, isLoading: staffLoading } = useQuery(
    'votingStaff',
    async () => {
      const response = await axios.get('/staff/voting');
      return response.data.data;
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!selectedCandidate) {
      newErrors.candidate = 'Please select a candidate';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for your vote';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      campaignId: campaign.id,
      candidateStaffId: selectedCandidate,
      reason: reason.trim()
    });
  };

  const handleClose = () => {
    console.log('VoteModal handleClose called, loading:', loading);
    if (!loading) {
      console.log('Closing VoteModal...');
      onClose();
    } else {
      console.log('VoteModal is loading, cannot close');
    }
  };

  const handleBackdropClick = (e) => {
    console.log('VoteModal backdrop clicked, target:', e.target);
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    console.log('VoteModal clicked, preventing propagation');
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        {/* Modal */}
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={handleModalClick}
        >
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-kestrel-100 rounded-lg flex items-center justify-center">
                  <Vote className="w-4 h-4 text-kestrel-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cast Your Vote
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="btn-ghost p-1 rounded-lg hover:bg-gray-100"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-body">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">{campaign.title}</h4>
                {campaign.description && (
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Candidate Selection */}
                <div>
                  <label htmlFor="candidate" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Select Candidate *</span>
                    </div>
                  </label>
                  <select
                    id="candidate"
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className={`input ${errors.candidate ? 'input-error' : ''}`}
                    disabled={loading || staffLoading}
                  >
                    <option value="">Choose a candidate...</option>
                    {staff?.map((member) => (
                      <option key={member.id} value={member.staff_id}>
                        {member.name} - {member.position}
                      </option>
                    ))}
                  </select>
                  {errors.candidate && (
                    <p className="mt-1 text-sm text-error-600">{errors.candidate}</p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Reason for Vote *</span>
                    </div>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={`input ${errors.reason ? 'input-error' : ''}`}
                    rows={4}
                    placeholder="Please explain why you're voting for this candidate (minimum 10 characters)..."
                    disabled={loading}
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-error-600">{errors.reason}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Minimum 10 characters required
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || staffLoading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Casting Vote...</span>
                      </>
                    ) : (
                      <>
                        <Vote className="w-4 h-4" />
                        <span>Cast Vote</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteModal;
