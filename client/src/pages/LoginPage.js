import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Shield, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Award,
  Star,
  Heart
} from 'lucide-react';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '',
    pin: '',
    username: '',
    password: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials = loginType === 'staff' 
        ? { staffId: formData.staffId, pin: formData.pin }
        : { username: formData.username, password: formData.password };

      const result = await login(credentials, loginType);
      
      if (result.success) {
        const redirectPath = loginType === 'staff' ? '/staff' : '/admin';
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kestrel-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pattern opacity-30"></div>
      
      <motion.div 
        className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Branding */}
        <motion.div 
          className="text-center lg:text-left space-y-6"
          variants={cardVariants}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-kestrel-500 to-kestrel-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold gradient-text">
                Kestrel Nest Garden
              </h1>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-display font-semibold text-gray-800">
              Staff of the Month
            </h2>
            
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Cast your vote for the most deserving team member. Your voice matters in recognizing excellence.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 pt-8">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-success-600" />
              </div>
              <span className="font-medium">Recognize Excellence</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-600" />
              </div>
              <span className="font-medium">Fair & Transparent Voting</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-warning-600" />
              </div>
              <span className="font-medium">Celebrate Team Success</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          className="card max-w-md mx-auto w-full"
          variants={cardVariants}
        >
          <div className="card-header text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Welcome Back
            </h3>
            <p className="text-gray-600 mt-1">
              Sign in to access the voting system
            </p>
          </div>

          <div className="card-body">
            {/* Login Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setLoginType('staff')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'staff'
                    ? 'bg-white text-kestrel-600 shadow-soft'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff</span>
              </button>
              
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'admin'
                    ? 'bg-white text-kestrel-600 shadow-soft'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginType === 'staff' ? (
                <>
                  <div>
                    <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                      Staff ID
                    </label>
                    <input
                      type="text"
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your staff ID"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                      PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="pin"
                        name="pin"
                        value={formData.pin}
                        onChange={handleInputChange}
                        className="input pr-10"
                        placeholder="Enter your PIN"
                        maxLength="4"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="input pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {loginType === 'staff' 
                  ? 'Need help? Contact your administrator'
                  : 'Default: admin / admin123'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
