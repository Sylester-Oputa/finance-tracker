import React from "react";
import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";

const ExpenseTransactions = ({ transactions, onSeeMore }) => {

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold">Expenses</h5>
        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>
      <div>
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions
            .slice(0, 4)
            .map((expense) => (
              <TransactionInfoCard
                key={expense._id || expense.id}
                title={expense.category}
                icon={expense.icon}
                date={
                  expense.date && moment(expense.date).isValid()
                    ? moment(expense.date).format("Do MMM YYYY")
                    : "Invalid date"
                }
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

export default ExpenseTransactions;
