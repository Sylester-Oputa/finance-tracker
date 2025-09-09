import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { CurrencyContext } from '../context/CurrencyContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ProfilePhotoSelector from '../components/Inputs/ProfilePhotoSelector';
import CurrencySelector from '../components/Inputs/CurrencySelector';
import Input from '../components/Inputs/Input';
import InfoModal from '../components/InfoModal';
import uploadImage from '../utils/uploadImage';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const Profile = () => {
  const { user, updateUser } = useContext(UserContext);
  const { updateCurrency } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    defaultCurrency: user?.defaultCurrency || 'USD'
  });

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'info', title: '', message: '' });
  };

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        defaultCurrency: user.defaultCurrency || 'USD'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpdate = async (file) => {
    setIsLoading(true);
    try {
      const { imageUrl } = await uploadImage(file);
      
      const response = await axiosInstance.put(API_PATHS.AUTH.PROFILE ?? '/api/v1/auth/profile', { profileImageUrl: imageUrl });

      if (response?.status === 200) {
        const updatedUser = response.data;
        updateUser(updatedUser.user || updatedUser);
        showModal('success', 'Success', 'Profile image updated successfully!');
      } else {
        showModal('error', 'Error', 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      showModal('error', 'Error', 'Failed to update profile image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.PROFILE ?? '/api/v1/auth/profile', { profileImageUrl: null });

      if (response?.status === 200) {
        const updatedUser = response.data;
        updateUser(updatedUser.user || updatedUser);
        showModal('success', 'Success', 'Profile image deleted successfully!');
      } else {
        showModal('error', 'Error', 'Failed to delete profile image');
      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
      showModal('error', 'Error', 'Failed to delete profile image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.PROFILE ?? '/api/v1/auth/profile', formData);

      if (response?.status === 200) {
        const updatedUser = response.data;
        updateUser(updatedUser.user || updatedUser);
        // Update currency across the app when defaultCurrency changes
        updateCurrency((updatedUser?.user?.defaultCurrency) || updatedUser?.defaultCurrency || formData.defaultCurrency);
        showModal('success', 'Success', 'Profile updated successfully!');
      } else {
        showModal('error', 'Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showModal('error', 'Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2 transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Profile Settings
          </h1>
          <p 
            className="transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <div 
            className="lg:col-span-1 p-6 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--color-cardBackground)' }}
          >
            <h2 
              className="text-xl font-semibold mb-4 transition-colors"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Profile Photo
            </h2>
            <div className="flex flex-col items-center">
              <ProfilePhotoSelector
                currentImage={user?.profileImageUrl}
                onImageUpdate={handleImageUpdate}
                onImageDelete={handleImageDelete}
                isLoading={isLoading}
                fullName={user?.fullName}
              />
              <p 
                className="text-sm mt-4 text-center transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Click to change your profile photo. Supported formats: JPG, PNG (max 5MB)
              </p>
            </div>
          </div>

          {/* Main Form Section */}
          <div 
            className="lg:col-span-2 p-6 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--color-cardBackground)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-xl font-semibold transition-colors"
                style={{ color: 'var(--color-textPrimary)' }}
              >
                Account Information
              </h2>
              <button
                onClick={() => navigate('/profile/security')}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-textPrimary)',
                  border: '1px solid var(--color-borderLight)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary)';
                  e.target.style.color = 'var(--color-textWhite)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-accent)';
                  e.target.style.color = 'var(--color-textPrimary)';
                }}
              >
                Security Settings
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors"
                    style={{ color: 'var(--color-textPrimary)' }}
                  >
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors"
                    style={{ color: 'var(--color-textPrimary)' }}
                  >
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2 transition-colors"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Preferred Currency
                </label>
                <CurrencySelector
                  value={formData.defaultCurrency}
                  onChange={(value) => setFormData(prev => ({ ...prev, defaultCurrency: value }))}
                />
              </div>

              {/* Account Status */}
              <div 
                className="p-4 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <h3 
                  className="text-sm font-medium mb-2 transition-colors"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Account Status
                </h3>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user?.emailVerifiedAt ? '#22c55e' : '#f59e0b' }}
                  ></div>
                  <span 
                    className="text-sm transition-colors"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {user?.emailVerifiedAt ? 'Email Verified' : 'Email Not Verified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user?.status === 'active' ? '#22c55e' : '#ef4444' }}
                  ></div>
                  <span 
                    className="text-sm transition-colors"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    Account {user?.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-textWhite)'
                  }}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </DashboardLayout>
  );
};

export default Profile;
