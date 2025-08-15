import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit, Users, Building, Mail, Phone, Key, Hash } from 'lucide-react';

const StaffModal = ({ staff, onClose, onSubmit, loading }) => {
  console.log('StaffModal rendered with props:', { staff, loading });
  console.log('StaffModal is visible and should be displayed!');
  
  const [formData, setFormData] = useState({
    staff_id: '',
    pin: '',
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (staff) {
      setFormData({
        staff_id: staff.staff_id || '',
        pin: '', // Don't show existing PIN for security
        name: staff.name || '',
        position: staff.position || '',
        department: staff.department || '',
        email: staff.email || '',
        phone: staff.phone || '',
        is_active: staff.is_active !== undefined ? staff.is_active : true
      });
    } else {
      // Generate default staff ID for new staff
      const defaultStaffId = `EMP${Math.floor(Math.random() * 900) + 100}`;
      setFormData(prev => ({
        ...prev,
        staff_id: defaultStaffId
      }));
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateStaffId = () => {
    const newStaffId = `EMP${Math.floor(Math.random() * 900) + 100}`;
    setFormData(prev => ({
      ...prev,
      staff_id: newStaffId
    }));
  };

  const generatePin = () => {
    const newPin = Math.floor(Math.random() * 9000) + 1000;
    setFormData(prev => ({
      ...prev,
      pin: newPin.toString()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrors({});

    console.log('StaffModal form submitted with data:', formData);

    // Validation
    const newErrors = {};
    if (!formData.staff_id.trim()) {
      newErrors.staff_id = 'Staff ID is required';
    }
    if (!formData.pin.trim()) {
      newErrors.pin = 'PIN is required';
    } else if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      return;
    }

    const submitData = staff 
      ? { id: staff.id, data: formData }
      : formData;
    
    console.log('Calling onSubmit with data:', submitData);
    onSubmit(submitData);
  };

  const handleClose = () => {
    console.log('handleClose called, loading:', loading);
    if (!loading) {
      console.log('Closing modal...');
      onClose();
    } else {
      console.log('Modal is loading, cannot close');
    }
  };

  const handleBackdropClick = (e) => {
    console.log('Backdrop clicked, target:', e.target);
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    console.log('Modal clicked, preventing propagation');
    e.stopPropagation();
  };

  const departments = [
    'Front of House',
    'Kitchen',
    'Bar',
    'Management',
    'Housekeeping',
    'Maintenance'
  ];

  const positions = [
    'Server',
    'Host/Hostess',
    'Chef',
    'Sous Chef',
    'Line Cook',
    'Bartender',
    'Manager',
    'Assistant Manager',
    'Housekeeper',
    'Maintenance Worker'
  ];

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
                  {staff ? <Edit className="w-4 h-4 text-kestrel-600" /> : <UserPlus className="w-4 h-4 text-kestrel-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                {/* Staff ID */}
                <div>
                  <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4" />
                      <span>Staff ID *</span>
                    </div>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="staff_id"
                      name="staff_id"
                      value={formData.staff_id}
                      onChange={handleInputChange}
                      className={`input flex-1 ${errors.staff_id ? 'input-error' : ''}`}
                      placeholder="e.g., EMP001"
                      disabled={loading || !!staff}
                    />
                    {!staff && (
                      <button
                        type="button"
                        onClick={generateStaffId}
                        disabled={loading}
                        className="btn-secondary px-3"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  {errors.staff_id && (
                    <p className="mt-1 text-sm text-error-600">{errors.staff_id}</p>
                  )}
                </div>

                {/* PIN */}
                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>PIN (4 digits) *</span>
                    </div>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      id="pin"
                      name="pin"
                      value={formData.pin}
                      onChange={handleInputChange}
                      className={`input flex-1 ${errors.pin ? 'input-error' : ''}`}
                      placeholder="Enter 4-digit PIN"
                      maxLength="4"
                      disabled={loading || !!staff}
                    />
                    {!staff && (
                      <button
                        type="button"
                        onClick={generatePin}
                        disabled={loading}
                        className="btn-secondary px-3"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  {errors.pin && (
                    <p className="mt-1 text-sm text-error-600">{errors.pin}</p>
                  )}
                  {!staff && (
                    <p className="mt-1 text-sm text-gray-500">
                      Staff will use this ID and PIN to log into the staff portal
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Full Name *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`input ${errors.position ? 'input-error' : ''}`}
                    disabled={loading}
                  >
                    <option value="">Select position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  {errors.position && (
                    <p className="mt-1 text-sm text-error-600">{errors.position}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Department *</span>
                    </div>
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`input ${errors.department ? 'input-error' : ''}`}
                    disabled={loading}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-error-600">{errors.department}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
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
                    Active staff member
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
                        {staff ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        <span>{staff ? 'Update Staff' : 'Add Staff'}</span>
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

export default StaffModal;
