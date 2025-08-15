import React, { useState } from 'react';
import { X, UserPlus, Users, Key } from 'lucide-react';

const SimpleStaffModal = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    id: '',
    prn: '',
    name: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrors({});

    console.log('SimpleStaffModal form submitted with data:', formData);

    // Simple validation
    const newErrors = {};
    if (!formData.id.trim()) {
      newErrors.id = 'ID is required';
    }
    if (!formData.prn.trim()) {
      newErrors.prn = 'PRN is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      return;
    }

    console.log('Calling onSubmit with data:', formData);
    onSubmit(formData);
  };

  const handleClose = () => {
    console.log('SimpleStaffModal handleClose called, loading:', loading);
    if (!loading) {
      console.log('Closing SimpleStaffModal...');
      onClose();
    } else {
      console.log('SimpleStaffModal is loading, cannot close');
    }
  };

  const handleBackdropClick = (e) => {
    console.log('SimpleStaffModal backdrop clicked, target:', e.target);
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    console.log('SimpleStaffModal clicked, preventing propagation');
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
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
          onClick={handleModalClick}
        >
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-kestrel-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-kestrel-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Staff Member
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
                {/* ID */}
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>ID *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    className={`input ${errors.id ? 'input-error' : ''}`}
                    placeholder="Enter ID"
                    disabled={loading}
                  />
                  {errors.id && (
                    <p className="mt-1 text-sm text-error-600">{errors.id}</p>
                  )}
                </div>

                {/* PRN */}
                <div>
                  <label htmlFor="prn" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>PRN *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="prn"
                    name="prn"
                    value={formData.prn}
                    onChange={handleInputChange}
                    className={`input ${errors.prn ? 'input-error' : ''}`}
                    placeholder="Enter PRN"
                    disabled={loading}
                  />
                  {errors.prn && (
                    <p className="mt-1 text-sm text-error-600">{errors.prn}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                  )}
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
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Add Staff</span>
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

export default SimpleStaffModal;
