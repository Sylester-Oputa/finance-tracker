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
          <div className="text-gray-400 text-center py-4">
            No recent transactions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
