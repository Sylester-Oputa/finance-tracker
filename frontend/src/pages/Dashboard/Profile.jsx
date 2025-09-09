import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LuUser, LuShield, LuEdit, LuSave, LuX } from "react-icons/lu";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import CurrencySelector from "../../components/Inputs/CurrencySelector";
import { UserContext } from "../../context/UserContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";

const Profile = () => {
  const { user, updateUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    defaultCurrency: user?.defaultCurrency || "NGN",
  });
  
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCurrencyChange = (currency) => {
    setFormData({
      ...formData,
      defaultCurrency: currency,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      let profileImageUrl = user?.profileImageUrl;

      // Upload new image if changed
      if (profileImage && profileImage !== user?.profileImageUrl) {
        profileImageUrl = await uploadImage(profileImage);
      }

      const updateData = {
        ...formData,
        profileImageUrl,
      };

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, updateData);

      if (response.data.success) {
        updateUser(response.data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      defaultCurrency: user?.defaultCurrency || "NGN",
    });
    setProfileImage(user?.profileImageUrl || null);
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <LuUser 
                className="text-xl"
                style={{ color: 'var(--color-primary)' }}
              />
            </div>
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: 'var(--color-textPrimary)' }}
              >
                Profile Settings
              </h1>
              <p style={{ color: 'var(--color-textSecondary)' }}>
                Manage your account information and preferences
              </p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-textWhite)'
              }}
            >
              <LuEdit className="text-sm" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'var(--color-textWhite)'
                }}
              >
                <LuSave className="text-sm" />
                <span>{loading ? "Saving..." : "Save"}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-textWhite)'
                }}
              >
                <LuX className="text-sm" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b" style={{ borderColor: 'var(--color-borderCard)' }}>
          <div
            className="px-4 py-2 border-b-2 font-medium"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)'
            }}
          >
            Profile Information
          </div>
          <Link
            to="/profile/security"
            className="px-4 py-2 font-medium transition-colors hover:text-primary"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Security
          </Link>
        </div>

        {/* Profile Form */}
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
            Personal Information
          </h3>

          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-4">
              <ProfilePhotoSelector 
                image={profileImage} 
                setImage={isEditing ? setProfileImage : () => {}} 
              />
              {!isEditing && (
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  Click "Edit Profile" to change your photo
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CurrencySelector
                value={formData.defaultCurrency}
                onChange={isEditing ? handleCurrencyChange : () => {}}
                label="Default Currency"
              />

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Account Status
                </label>
                <div className="flex items-center space-x-2">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: user?.emailVerifiedAt 
                        ? 'var(--color-successLight)' 
                        : 'var(--color-warningLight)',
                      color: user?.emailVerifiedAt 
                        ? 'var(--color-success)' 
                        : 'var(--color-warning)'
                    }}
                  >
                    {user?.emailVerifiedAt ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Member Since
                </label>
                <p style={{ color: 'var(--color-textSecondary)' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-textPrimary)' }}
                >
                  Last Updated
                </label>
                <p style={{ color: 'var(--color-textSecondary)' }}>
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
