import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import InfoCard from "../../components/Cards/InfoCard";
import { IoMdCard } from "react-icons/io";
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu";
import { addThousandsSeparator } from "../../utils/helper";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import Loader from "../../components/Loader";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`);

      if (res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <Loader text="Loading Dashboard..." />
        )}
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-[#3C3F58]"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
            color="bg-[#E66A2B]"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandsSeparator(dashboardData?.totalExpense || 0)}
            color="bg-[#FF5C58]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={
              Array.isArray(dashboardData?.recentTransactions)
                ? dashboardData.recentTransactions
                : []
            }
          />

          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpense || 0}
          />

          <ExpenseTransactions
            transactions={
              Array.isArray(dashboardData?.last30DaysExpenses?.transactions)
                ? dashboardData.last30DaysExpenses.transactions
                : []
            }
            onSeeMore={() => navigate("/expense")}
          />

          <Last30DaysExpenses
            data={
              Array.isArray(dashboardData?.last30DaysExpenses?.transactions)
                ? dashboardData.last30DaysExpenses.transactions
                : []
            }
          />

          <RecentIncomeWithChart
            data={
              Array.isArray(dashboardData?.last60DaysIncome?.transactions) &&
              dashboardData.last60DaysIncome.transactions.length
                ? dashboardData.last60DaysIncome.transactions.slice(0, 4)
                : [
                    {
                      source: "Total Income",
                      amount: dashboardData?.totalIncome || 0,
                    },
                  ]
            }
            totalIncome={dashboardData?.totalIncome || 0}
          />

          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
