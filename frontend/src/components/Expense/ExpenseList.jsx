import React from "react";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";

const ExpenseList = ({ onDownload, onDelete, transactions }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Expense List</h5>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div>
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions.slice(0, 4).map((expense) => (
            <div key={expense._id || expense.id} className="grid grid-cols-1 md:grid-cols-2">
              <TransactionInfoCard
                key={`expense-card-${expense._id || expense.id}`}
                title={expense.category}
                icon={expense.icon}
                date={moment(expense.date).format("Do MMM YYYY")}
                amount={expense.amount}
                type="expense"
                onDelete={() => onDelete(expense._id || expense.id)}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full py-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-1a3 3 0 013-3h0a3 3 0 013 3v1m-3-3v1m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
            <p className="text-sm font-medium">No transactions to show yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Your recent transactions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
