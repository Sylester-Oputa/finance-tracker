import React from "react";
import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";

const RecentIncome = ({ transactions, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income</h5>
        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="mt-6">
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions
            .slice(0, 4)
            .map((item) => (
              <TransactionInfoCard
                key={item._id}
                title={item.source}
                icon={item.icon}
                date={moment(item.date).format("Do MMM YYYY")}
                amount={item.amount}
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

export default RecentIncome;
