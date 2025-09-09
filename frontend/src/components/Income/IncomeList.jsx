import React from "react";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import { TransactionGrid } from "../SafeList";
import moment from "moment";

const ImprovedIncomeList = ({ onDownload, onDelete, transactions }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold">Income Sources</h5>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <TransactionGrid
        transactions={transactions}
        limit={4}
        columns="grid-cols-1 md:grid-cols-2"
        emptyMessage="No income transactions to show yet"
        renderTransaction={(income) => (
          <TransactionInfoCard
            title={income.source}
            icon={income.icon}
            date={moment(income.date).format("Do MMM YYYY")}
            amount={income.amount}
            type="income"
            onDelete={() => onDelete(income._id || income.id)}
          />
        )}
      />
    </div>
  );
};

export default ImprovedIncomeList;
