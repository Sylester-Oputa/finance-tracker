import React from "react";
import { LuArrowRight } from "react-icons/lu";
import moment from "moment";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

const RecentTransactions = ({ transactions }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold">Recent Transactions</h5>
      </div>

      <div className="mt-4">
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions
            .slice(0, 4)
            .map((item) => (
              <TransactionInfoCard
                key={item._id}
                title={item.type == "expense" ? item.category : item.source}
                icon={item.icon}
                date={moment(item.date).format("Do MMM YYYY")}
                amount={item.amount}
                type={item.type}
                hideDeleteBtn
              />
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

export default RecentTransactions;
