import React from "react";
import { MdOutlineCancel } from "react-icons/md";

const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex justify-center items-center w-full h-full backdrop-blur-xs">
      <div className="relative p-4 md:p-20 w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div 
          className="relative rounded-lg shadow-sm transition-colors"
          style={{ backgroundColor: 'var(--color-modalBackground)' }}
        >
          {/* Modal header */}
          <div 
            className="flex items-center justify-between p-4 md:p-5 border-b transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h3 
              className="text-lg font-bold transition-colors"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              {title}
            </h3>
            <button
              type="button"
              className="bg-transparent rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer transition-colors hover:opacity-75"
              style={{ color: 'var(--color-textPrimary)' }}
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
