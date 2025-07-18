import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { LuImage, LuX } from "react-icons/lu";

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-blue-50 text-primary rounded-lg">
          {icon ? <span className="text-3xl">{icon}</span> : <LuImage />}
        </div>
        <p className="">{icon ? "Change Icon" : "Pick Icon"}</p>
      </div>

      {isOpen && (
        <div className="relative z-50">
          <button
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-50 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <LuX />
          </button>

          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              onSelect(emoji.native); // <-- This is the emoji character
              setIsOpen(false);
            }}
            theme="light"
            previewPosition="none"
            perLine={8}
            maxFrequentRows={0}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerPopup;
