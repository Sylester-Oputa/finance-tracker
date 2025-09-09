import React, { useEffect, useState, useContext } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { UserContext } from "../../context/UserContext";
import { formatCurrency } from "../../utils/helper";
import ErrorBoundary from "../ErrorBoundary";
import { DashboardErrorFallback } from "../ErrorFallbacks";

const RecentTransaction = ({ transaction, userCurrency }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div 
      className="flex items-center justify-between py-3 border-b last:border-b-0 transition-colors"
      style={{ borderColor: 'var(--color-borderCard)' }}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            transaction.type === "income"
              ? "status-success"
              : "status-error"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}
        </div>
        <div>
          <p 
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            {transaction.description}
          </p>
          <p 
            className="text-xs transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {transaction.category} • {formatDate(transaction.date)}
          </p>
        </div>
      </div>
      <div
        className={`text-sm font-medium ${
          transaction.type === "income" ? "text-green-600" : "text-red-600"
        }`}
        style={{ 
          color: transaction.type === "income" 
            ? 'var(--color-success)' 
            : 'var(--color-error)' 
        }}
      >
        {transaction.type === "income" ? "+" : "-"}
        {formatCurrency(transaction.amount, userCurrency)}
      </div>
    </div>
  );
};

const UpcomingReminder = ({ reminder, userCurrency }) => {
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;

  const getUrgencyColor = () => {
    if (isOverdue) return 'var(--color-error)';
    if (isDueToday) return 'var(--color-warning)';
    if (diffDays <= 3) return 'var(--color-warning)';
    return 'var(--color-info)';
  };

  const getTimeText = () => {
    if (isOverdue) return `${Math.abs(diffDays)} days overdue`;
    if (isDueToday) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  return (
    <div 
      className="flex items-center justify-between py-3 border-b last:border-b-0 transition-colors"
      style={{ borderColor: 'var(--color-borderCard)' }}
    >
      <div>
        <p 
          className="text-sm font-medium transition-colors"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          {reminder.title}
        </p>
        {reminder.amount && (
          <p 
            className="text-xs transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {formatCurrency(reminder.amount, userCurrency)}
          </p>
        )}
      </div>
      <div 
        className="text-xs font-medium transition-colors"
        style={{ color: getUrgencyColor() }}
      >
        {getTimeText()}
      </div>
    </div>
  );
};

const DashboardOverview = ({ onNavigate }) => {
  const {
    budgets,
    budgetAnalytics,
    goals,
    reminders,
    dashboardData,
    fetchDashboardData,
    fetchBudgets,
    fetchBudgetAnalytics,
    fetchGoals,
    fetchReminders,
    refreshAllData,
    loading,
  } = useDashboard();

  const { user } = useContext(UserContext);
  const userCurrency = user?.defaultCurrency || "USD";

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    budgetUsage: 0,
    totalSavingsFromGoals: 0,
    upcomingDues: 0,
    netWorth: 0,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchBudgets(),
        fetchBudgetAnalytics(),
        fetchGoals(),
        fetchReminders(),
      ]);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      setFinancialSummary((prev) => ({
        ...prev,
        totalIncome: dashboardData.totalIncome || 0,
        totalExpenses: dashboardData.totalExpense || 0,
        netAmount: dashboardData.totalBalance || 0,
      }));

      if (dashboardData.recentTransactions) {
        const formattedTransactions = dashboardData.recentTransactions.map(
          (transaction) => ({
            id: transaction.id,
            type: transaction.type,
            description:
              transaction.type === "income"
                ? transaction.source
                : transaction.category,
            category:
              transaction.type === "income" ? "Income" : transaction.category,
            amount: transaction.amount,
            date: new Date(transaction.date),
          })
        );
        setRecentTransactions(formattedTransactions);
      }
    }
  }, [dashboardData]);

  useEffect(() => {
    if (!dashboardData) return;

    const safeGoals = goals || [];
    const safeReminders = reminders || [];

    // Use real budget analytics from backend
    const budgetUsage = budgetAnalytics ? budgetAnalytics.overallUsage : 0;

    const totalSavingsFromGoals = safeGoals
      .filter((goal) => goal.completed)
      .reduce((sum, goal) => sum + (goal.progress || 0), 0);

    const upcomingDues = safeReminders
      .filter((reminder) => !reminder.paid)
      .filter((reminder) => {
        const dueDate = new Date(reminder.dueDate);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      })
      .reduce((sum, reminder) => sum + (reminder.amount || 0), 0);

    const netWorth =
      (dashboardData.totalIncome || 0) -
      (dashboardData.totalExpense || 0) +
      totalSavingsFromGoals;

    setFinancialSummary((prev) => ({
      ...prev,
      budgetUsage,
      totalSavingsFromGoals,
      upcomingDues,
      netWorth,
    }));
  }, [budgets, goals, reminders, dashboardData, budgetAnalytics]);

  const budgetAlerts = budgetAnalytics ? budgetAnalytics.budgetAlerts : 0;

  const upcomingReminders = (reminders || [])
    .filter((reminder) => !reminder.paid)
    .filter((reminder) => {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();
      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 14;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const completedGoals = (goals || []).filter((goal) => goal.completed);

  if (loading) {
    return (
      <div 
        className="text-center py-8 transition-colors"
        style={{ color: 'var(--color-textPrimary)' }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Streamlined Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-3xl font-bold transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Welcome back, {user?.fullName?.split(" ")[0] || "User"}! 👋
          </h1>
          <p 
            className="mt-1 transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Here's your financial snapshot
          </p>
        </div>
        <button
          onClick={refreshAllData}
          className="text-sm font-medium flex items-center gap-2 transition-colors hover:opacity-75"
          style={{ color: 'var(--color-primary)' }}
          title="Refresh dashboard data"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Financial Snapshot - Core Metrics Only */}
      <div 
        className="rounded-xl shadow-lg p-8 text-white transition-colors"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primaryLight))' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium opacity-80">Total Income</p>
            <p className="text-2xl md:text-3xl font-bold">
              {formatCurrency(financialSummary.totalIncome, userCurrency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium opacity-80">Net Worth</p>
            <p className="text-3xl md:text-4xl font-bold">
              {formatCurrency(financialSummary.netWorth, userCurrency)}
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <div 
                className="flex-1 rounded-full h-2 max-w-32 opacity-50"
                style={{ backgroundColor: 'var(--color-textWhite)' }}
              >
                <div
                  className={`h-2 rounded-full transition-all duration-300`}
                  style={{
                    backgroundColor: financialSummary.netAmount >= 0
                      ? 'var(--color-success)'
                      : 'var(--color-error)',
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        (financialSummary.netAmount /
                          (financialSummary.totalIncome || 1)) *
                          100 +
                          50
                      )
                    )}%`,
                  }}
                />
              </div>
              <span className="text-xs opacity-80">
                {financialSummary.netAmount >= 0 ? "Healthy" : "Alert"}
              </span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-medium opacity-80">This Month</p>
            <p className="text-2xl md:text-3xl font-bold">
              {formatCurrency(financialSummary.netAmount, userCurrency)}
            </p>
            <p className="text-xs opacity-70">Income - Expenses</p>
          </div>
        </div>
      </div>

      {/* Key Metrics - Reduced to Essential 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Budget Usage
              </p>
              <p 
                className="text-2xl font-bold transition-colors"
                style={{ color: 'var(--color-textPrimary)' }}
              >
                {financialSummary.budgetUsage.toFixed(0)}%
              </p>
              <p 
                className="text-xs transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                {budgetAlerts > 0 ? `${budgetAlerts} over limit` : "On track"}
              </p>
            </div>
            <div
              className={`text-3xl`}
              style={{ 
                color: financialSummary.budgetUsage > 80
                  ? 'var(--color-error)'
                  : 'var(--color-info)'
              }}
            >
              📊
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Savings Goals
              </p>
              <p 
                className="text-2xl font-bold transition-colors"
                style={{ color: 'var(--color-textPrimary)' }}
              >
                {formatCurrency(
                  financialSummary.totalSavingsFromGoals,
                  userCurrency
                )}
              </p>
              <p 
                className="text-xs transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                {completedGoals.length} of {goals?.length || 0} completed
              </p>
            </div>
            <div 
              className="text-3xl"
              style={{ color: 'var(--color-success)' }}
            >
              🎯
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Upcoming Bills
              </p>
              <p 
                className="text-2xl font-bold transition-colors"
                style={{ color: 'var(--color-textPrimary)' }}
              >
                {formatCurrency(financialSummary.upcomingDues, userCurrency)}
              </p>
              <p 
                className="text-xs transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Next 30 days
              </p>
            </div>
            <div 
              className="text-3xl"
              style={{ color: 'var(--color-warning)' }}
            >
              ⏰
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Simplified */}
      <div className="card">
        <h3 
          className="text-lg font-semibold mb-4 transition-colors"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate?.("/income")}
            className="flex flex-col items-center p-4 text-center rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-successLight)' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-success)';
              e.target.style.color = 'var(--color-textWhite)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--color-successLight)';
              e.target.style.color = 'var(--color-textPrimary)';
            }}
          >
            <div className="text-2xl mb-2">💰</div>
            <span className="text-sm font-medium">
              Add Income
            </span>
          </button>
          <button
            onClick={() => onNavigate?.("/expense")}
            className="flex flex-col items-center p-4 text-center rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-errorLight)' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-error)';
              e.target.style.color = 'var(--color-textWhite)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--color-errorLight)';
              e.target.style.color = 'var(--color-textPrimary)';
            }}
          >
            <div className="text-2xl mb-2">💸</div>
            <span className="text-sm font-medium">
              Add Expense
            </span>
          </button>
          <button
            onClick={() => onNavigate?.("/dashboard/budgets")}
            className="flex flex-col items-center p-4 text-center rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-infoLight)' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-info)';
              e.target.style.color = 'var(--color-textWhite)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--color-infoLight)';
              e.target.style.color = 'var(--color-textPrimary)';
            }}
          >
            <div className="text-2xl mb-2">📋</div>
            <span className="text-sm font-medium">Budgets</span>
          </button>
          <button
            onClick={() => onNavigate?.("/dashboard/goals")}
            className="flex flex-col items-center p-4 text-center rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-primary)';
              e.target.style.color = 'var(--color-textWhite)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--color-accent)';
              e.target.style.color = 'var(--color-textPrimary)';
            }}
          >
            <div className="text-2xl mb-2">🎯</div>
            <span className="text-sm font-medium">Goals</span>
          </button>
        </div>
      </div>

      {/* Recent Activity - Consolidated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 
              className="text-lg font-semibold transition-colors"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigate?.("/expense")}
              className="text-sm transition-colors hover:opacity-75"
              style={{ color: 'var(--color-primary)' }}
            >
              View All
            </button>
          </div>
          {(recentTransactions || []).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p 
                className="transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                No recent transactions
              </p>
              <button
                onClick={() => onNavigate?.("/expense")}
                className="text-sm mt-2 transition-colors hover:opacity-75"
                style={{ color: 'var(--color-primary)' }}
              >
                Add your first transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(recentTransactions || []).slice(0, 4).map((transaction) => (
                <RecentTransaction
                  key={transaction.id}
                  transaction={transaction}
                  userCurrency={userCurrency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Important Alerts */}
        <div className="card">
          <h3 
            className="text-lg font-semibold mb-4 transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            Important Alerts
          </h3>

          {/* Budget Alerts */}
          {budgetAlerts > 0 && (
            <div 
              className="mb-4 p-3 border rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--color-errorLight)', 
                borderColor: 'var(--color-error)' 
              }}
            >
              <div className="flex items-center space-x-2">
                <span style={{ color: 'var(--color-error)' }}>⚠️</span>
                <span 
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-error)' }}
                >
                  {budgetAlerts} budget{budgetAlerts !== 1 ? "s" : ""} over 80%
                </span>
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              <p 
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Upcoming Bills
              </p>
              {upcomingReminders.slice(0, 3).map((reminder) => (
                <UpcomingReminder
                  key={reminder.id}
                  reminder={reminder}
                  userCurrency={userCurrency}
                />
              ))}
              {upcomingReminders.length > 3 && (
                <button
                  onClick={() => onNavigate?.("/dashboard/reminders")}
                  className="text-sm transition-colors hover:opacity-75"
                  style={{ color: 'var(--color-primary)' }}
                >
                  View {upcomingReminders.length - 3} more
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p 
                className="transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                All caught up!
              </p>
              <p 
                className="text-xs mt-1 transition-colors"
                style={{ color: 'var(--color-textMuted)' }}
              >
                No upcoming bills or alerts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardOverviewWithErrorBoundary = (props) => (
  <ErrorBoundary fallback={DashboardErrorFallback}>
    <DashboardOverview {...props} />
  </ErrorBoundary>
);

export default DashboardOverviewWithErrorBoundary;
