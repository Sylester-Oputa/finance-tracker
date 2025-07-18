import React from "react";
import { MdOutlineCancel } from "react-icons/md";

const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full backdrop-blur-xs">
      <div className="relative p-4 md:p-20 w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div className="relative rounded-lg shadow-sm bg-[#FFFAE5]">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#935F4C]">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              type="button"
              className="bg-transparent hover:bg-black hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer"
              onClick={onClose}
            >
              <MdOutlineCancel size={25} />
            </button>
          </div>
          {/* Modal body */}
          <div className="p-4 md:p-5 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
