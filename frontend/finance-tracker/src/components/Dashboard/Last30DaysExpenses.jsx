import React, { useEffect, useState } from "react";
import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomLineChart from "../Charts/CustomLineChart";

const Last30DaysExpenses = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareExpenseBarChartData(data);
    setChartData(result);

    return () => {};
  }, [data]);
  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold">Last 30 Days Expenses</h5>
      </div>

      <div>
        {Array.isArray(data) && data.length > 0 ? (
          <CustomLineChart data={chartData} />
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

export default Last30DaysExpenses;
