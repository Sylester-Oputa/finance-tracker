import React from "react";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";

const IncomeList = ({ onDownload, onDelete, transactions }) => {
  // Function to handle download of income details

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold">Income Sources</h5>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions
            .slice(0, 4)
            .map((income) => (
              <TransactionInfoCard
                key={income._id}
                title={income.source}
                icon={income.icon}
                date={moment(income.date).format("Do MMM YYYY")}
                amount={income.amount}
                type="income"
                hideDeleteBtn
              />
            ))
        ) : (
          <div className="text-gray-400 text-center py-4">No income found.</div>
        )}
      </div>
    </div>
  );
};

export default IncomeList;
