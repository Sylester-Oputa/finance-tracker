import React, { useState, useEffect, useCallback, useContext } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TransactionInfoCard from "../../components/Cards/TransactionInfoCard";
import moment from "moment";
import Loader from "../../components/Loader";
import { CurrencyContext } from "../../context/CurrencyContext";

const Transactions = () => {
  useUserAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, income, expense
  const { currentCurrency } = useContext(CurrencyContext);

  const fetchAllTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both income and expense transactions
      const [incomeResponse, expenseResponse] = await Promise.all([
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE)
      ]);

      // Combine and sort transactions by date
      const allTransactions = [
        ...(incomeResponse.data || []).map(item => ({
          ...item,
          type: 'income',
          title: item.source,
          category: 'Income'
        })),
        ...(expenseResponse.data || []).map(item => ({
          ...item,
          type: 'expense',
          title: item.category,
          category: item.category
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
    } catch (err) {
      setError("Failed to fetch transactions. Please try again.");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions, currentCurrency]);

  const handleDeleteTransaction = async (id, type) => {
    try {
      if (type === 'income') {
        await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      } else {
        await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      }
      
      // Refresh transactions
      fetchAllTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  const getTransactionCounts = () => {
    const all = transactions.length;
    const income = transactions.filter(t => t.type === 'income').length;
    const expense = transactions.filter(t => t.type === 'expense').length;
    return { all, income, expense };
  };

  const counts = getTransactionCounts();

  return (
    <DashboardLayout activeMenu="Transactions">
      <div className="my-5 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          {[
            { key: "all", label: `All (${counts.all})` },
            { key: "income", label: `Income (${counts.income})` },
            { key: "expense", label: `Expenses (${counts.expense})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader text="Loading transactions..." />
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === "all" 
              ? "No transactions found. Start by adding some income or expenses!"
              : `No ${filter} transactions found.`
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransactions.map((transaction) => (
              <div key={`${transaction.type}-${transaction._id}`} className="bg-white rounded-lg shadow">
                <TransactionInfoCard
                  title={transaction.title}
                  icon={transaction.icon}
                  date={moment(transaction.date).format("Do MMM YYYY")}
                  amount={transaction.amount}
                  type={transaction.type}
                  onDelete={() => handleDeleteTransaction(transaction._id, transaction.type)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
