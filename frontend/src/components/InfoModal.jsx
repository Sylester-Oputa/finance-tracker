import React from "react";
import Modal from "./Modal";

const InfoModal = ({ 
  isOpen, 
  onClose, 
  title = "Information",
  message,
  type = "info", // info, success, warning, error
  buttonText = "OK"
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          titleColor: "text-green-800",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      case "warning":
        return {
          icon: "⚠️",
          titleColor: "text-orange-800",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        };
      case "error":
        return {
          icon: "❌",
          titleColor: "text-red-800",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      default:
        return {
          icon: "ℹ️",
          titleColor: "text-blue-800",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
    }
  };

  const { icon, titleColor, bgColor, borderColor } = getIconAndColor();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`p-6 rounded-lg border ${bgColor} ${borderColor}`}>
        <div className="flex items-start space-x-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
            <p className="text-sm text-gray-700 mt-2">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;
