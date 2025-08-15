import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit, Megaphone, FileText, Clock } from 'lucide-react';

const CampaignModal = ({ campaign, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('CampaignModal useEffect - campaign:', campaign);
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        startDate: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
        endDate: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
        is_active: campaign.is_active !== undefined ? campaign.is_active : true
      });
    } else {
      // Set default dates for new campaign
      const now = new Date();
      const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      setFormData({
        title: '',
        description: '',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        is_active: true
      });
    }
    console.log('Form data set:', formData);
  }, [campaign]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submitted!', formData);
    setErrors({});

    // Temporary: Skip validation for testing
    const submitData = campaign 
      ? { id: campaign.id, data: formData }
      : formData;
    
    console.log('Submitting data:', submitData);
    onSubmit(submitData);
  };

  const handleClose = () => {
    console.log('CampaignModal handleClose called, loading:', loading);
    if (!loading) {
      console.log('Closing CampaignModal...');
      onClose();
    } else {
      console.log('CampaignModal is loading, cannot close');
    }
  };

  const handleBackdropClick = (e) => {
    console.log('CampaignModal backdrop clicked, target:', e.target);
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    console.log('CampaignModal clicked, preventing propagation');
    e.stopPropagation();
  };

  console.log('CampaignModal rendering - loading:', loading, 'formData:', formData);
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
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10"
          onClick={handleModalClick}
        >
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-kestrel-100 rounded-lg flex items-center justify-center">
                  {campaign ? <Edit className="w-4 h-4 text-kestrel-600" /> : <Megaphone className="w-4 h-4 text-kestrel-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {campaign ? 'Edit Campaign' : 'Create New Campaign'}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter campaign title"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Description</span>
                    </div>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input"
                    rows={3}
                    placeholder="Enter campaign description (optional)"
                    disabled={loading}
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Start Date *</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>End Date *</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="input"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-kestrel-600 focus:ring-kestrel-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active campaign
                  </label>
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
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        {campaign ? <Edit className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                        <span>{campaign ? 'Update Campaign' : 'Create Campaign'}</span>
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

export default CampaignModal;
