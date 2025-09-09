import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LuShield, LuUser, LuEye, LuEyeOff, LuSave, LuTrash2 } from "react-icons/lu";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Input from "../../components/Inputs/Input";
import ConfirmationModal from "../../components/ConfirmationModal";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const Security = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.put("/api/v1/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      const errorMessage = error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.delete(API_PATHS.AUTH.DELETE_ACCOUNT);

      if (response.data.success) {
        toast.success("Account deleted successfully");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <LuShield 
              className="text-xl"
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Security Settings
            </h1>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Manage your account security and privacy
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b" style={{ borderColor: 'var(--color-borderCard)' }}>
          <Link
            to="/profile"
            className="px-4 py-2 font-medium transition-colors hover:text-primary"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Profile Information
          </Link>
          <div
            className="px-4 py-2 border-b-2 font-medium"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)'
            }}
          >
            Security
          </div>
        </div>

        {/* Change Password */}
        <div 
          className="card"
          style={{
            backgroundColor: 'var(--color-cardBackground)',
            borderColor: 'var(--color-borderCard)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-6"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Change Password
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your new password (min 8 characters)"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-textWhite)'
              }}
            >
              <LuSave className="text-sm" />
              <span>{loading ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </div>

        {/* Security Information */}
        <div 
          className="card"
          style={{
            backgroundColor: 'var(--color-cardBackground)',
            borderColor: 'var(--color-borderCard)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Security Information
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                  Two-Factor Authentication
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Add an extra layer of security to your account
                </p>
              </div>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-warningLight)',
                  color: 'var(--color-warning)'
                }}
              >
                Coming Soon
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                  Login Sessions
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  Manage your active sessions across devices
                </p>
              </div>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-textWhite)'
                }}
              >
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div 
          className="card border-red-200"
          style={{
            backgroundColor: 'var(--color-cardBackground)',
            borderColor: 'var(--color-error)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-error)' }}
          >
            Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-errorLight)' }}>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--color-error)' }}>
                  Delete Account
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                  Permanently delete your account and all associated data
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-textWhite)'
                }}
              >
                <LuTrash2 className="text-sm" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
          confirmText="Delete Account"
          cancelText="Cancel"
          isDestructive={true}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Security;
