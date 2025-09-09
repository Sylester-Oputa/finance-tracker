import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import Input from '../components/Inputs/Input';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';

const Security = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'info', title: '', message: '' });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showModal('error', 'Password Mismatch', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showModal('error', 'Invalid Password', 'New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        showModal('success', 'Success', 'Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        let errorMsg = 'Failed to change password';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const error = await response.json();
            errorMsg = error.message || error.error || errorMsg;
          } else {
            const text = await response.text();
            errorMsg = text || errorMsg;
          }
        } catch {}
        showModal('error', 'Error', errorMsg);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showModal('error', 'Error', 'Error changing password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        localStorage.clear();
        showModal('success', 'Account Deleted', 'Account deleted successfully');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        let errorMsg = 'Failed to delete account';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const error = await response.json();
            errorMsg = error.message || error.error || errorMsg;
          } else {
            const text = await response.text();
            errorMsg = text || errorMsg;
          }
        } catch {}
        showModal('error', 'Error', errorMsg);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showModal('error', 'Error', 'Error deleting account. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Security">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 mb-4 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <h1 
            className="text-3xl font-bold mb-2 transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Security Settings
          </h1>
          <p 
            className="transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Manage your account security and password
          </p>
        </div>

        <div className="space-y-8">
          {/* Change Password Section */}
          <div 
            className="p-6 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--color-cardBackground)' }}
          >
            <h2 
              className="text-xl font-semibold mb-6 transition-colors"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2 transition-colors"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Current Password
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors"
                    style={{ color: 'var(--color-textPrimary)' }}
                  >
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors"
                    style={{ color: 'var(--color-textPrimary)' }}
                  >
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
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
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Information */}
          <div 
            className="p-6 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--color-cardBackground)' }}
          >
            <h2 
              className="text-xl font-semibold mb-4 transition-colors"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Security Information
            </h2>

            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <h3 
                  className="font-medium mb-2 transition-colors"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Password Requirements
                </h3>
                <ul 
                  className="text-sm space-y-1 transition-colors"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>

              <div 
                className="p-4 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <h3 
                  className="font-medium mb-2 transition-colors"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Two-Factor Authentication
                </h3>
                <p 
                  className="text-sm transition-colors"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  Two-factor authentication is not currently enabled. This feature will be available in a future update.
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div 
            className="p-6 rounded-xl border transition-colors"
            style={{ 
              backgroundColor: 'var(--color-cardBackground)',
              borderColor: '#ef4444'
            }}
          >
            <h2 
              className="text-xl font-semibold mb-4"
              style={{ color: '#ef4444' }}
            >
              Danger Zone
            </h2>

            <div 
              className="p-4 rounded-lg mb-4 border transition-colors"
              style={{ 
                backgroundColor: 'var(--color-accent)',
                borderColor: '#ef4444'
              }}
            >
              <h3 
                className="font-medium mb-2"
                style={{ color: '#ef4444' }}
              >
                Delete Account
              </h3>
              <p 
                className="text-sm mb-4 transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Once you delete your account, there is no going back. Please be certain. All your data including transactions, budgets, and settings will be permanently deleted.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ef4444' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete Account"
        confirmButtonStyle={{ backgroundColor: '#ef4444' }}
        isLoading={isLoading}
      />

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

export default Security;
