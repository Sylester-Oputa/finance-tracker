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

      <div className="grid grid-cols-1 md:grid-cols-2">
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions
            .slice(0, 4)
            .map((expense) => (
              <TransactionInfoCard
                key={expense._id || expense.id}
                title={expense.category}
                icon={expense.icon}
                date={moment(expense.date).format("Do MMM YYYY")}
                amount={expense.amount}
                type="expense"
                hideDeleteBtn
              />
            ))
        ) : (
          <div className="text-gray-400 text-center py-4">
            No expenses found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
