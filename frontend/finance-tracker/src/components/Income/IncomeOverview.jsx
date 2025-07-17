import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import CustomBarChart from "../Charts/CustomBarChart";
import { prepareIncomeBarChartData } from "../../utils/helper";

const IncomeOverview = ({ transactions, onAddIncome }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareIncomeBarChartData(transactions);
    setChartData(result);
  }, [transactions]);
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="">
          <h5 className="text-lg font-bold">Income Overview</h5>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your income sources and amounts over time.
          </p>
        </div>
        <button className="add-btn" onClick={onAddIncome}>
          <LuPlus className="text-lg" />
          Add Income
        </button>
      </div>
      <div className="mt-10">
        {Array.isArray(transactions) && transactions.length > 0 ? (
          <CustomBarChart data={chartData} />
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

export default IncomeOverview;
