import React, { useRef, useState, useEffect } from "react";
import { LuTrash, LuCamera } from "react-icons/lu";
import { MdEdit } from "react-icons/md";

// Props:
// - currentImage: string | null (URL)
// - onImageUpdate: (file: File) => Promise<void> | void
// - onImageDelete: () => Promise<void> | void
// - fullName?: string (for alt)
// - isLoading?: boolean (disable interactions when true)
const ProfilePhotoSelector = ({ currentImage, onImageUpdate, onImageDelete, fullName = "", isLoading = false }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Update preview when image prop changes
  useEffect(() => {
    if (currentImage) {
      // Assume currentImage is URL string from server
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl(null);
    }
  }, [currentImage]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Optimistically show preview
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      // Fire parent handler
      onImageUpdate && onImageUpdate(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    
    // Clear the file input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    // Revoke the current preview URL to free memory
    if (previewUrl && typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Clear both states
    setPreviewUrl(null);
    onImageDelete && onImageDelete();
  };

  const onChooseFile = () => {
    if (!isLoading) inputRef.current?.click();
  };

  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="relative group">
        {!previewUrl ? (
          <button
            type="button"
            onClick={onChooseFile}
            className="w-24 h-24 flex flex-col items-center justify-center bg-gradient-to-br from-[#c2978a] to-[#935F4C] hover:from-[#935F4C] hover:to-[#A86D59] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer border-4 border-white disabled:opacity-60"
            disabled={isLoading}
          >
            <LuCamera className="text-2xl text-white mb-1" />
            <span className="text-xs text-white font-medium">Add Photo</span>
          </button>
        ) : (
          <div 
            className="relative cursor-pointer transition-all duration-300 transform hover:scale-105"
            onClick={onChooseFile}
          >
            <img
              src={previewUrl}
              alt={fullName ? `${fullName}'s profile photo` : "profile photo"}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <MdEdit className="text-2xl text-white" />
            </div>
            
            {/* Remove button */}
            <button
              className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full absolute -top-1 -right-1 shadow-lg transition-colors duration-200 z-10"
              type="button"
              onClick={handleRemoveImage}
              title="Remove photo"
              disabled={isLoading}
            >
              <LuTrash className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoSelector;
