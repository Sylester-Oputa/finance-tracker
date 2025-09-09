import React from "react";

const InfoCard = ({ icon, label, value, color }) => {
    return (
      <div className="flex gap-6 p-6 rounded-2xl bg-[#FFFFFF] shadow-md shadow-gray-200 border border-gray-200/50">
        <div
          className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
        >
          {icon}
        </div>
        <div>
          <h6 className="text-[#564A47] font-bold">{label}</h6>
          <span className="text-[22px]">₦{value}</span>
        </div>
      </div>
    );
};

export default InfoCard;
