import React, { useEffect, useState, useContext } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { UserContext } from "../../context/UserContext";
import { useResponsive } from "../../hooks/useResponsive";
import { formatCurrency } from "../../utils/helper";
import ErrorBoundary from "../ErrorBoundary";
import { DashboardErrorFallback } from "../ErrorFallbacks";

const StatCard = ({ title, value, subtitle, color = "blue", icon }) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {icon && <div className={`text-${color}-600 text-3xl`}>{icon}</div>}
    </div>
  </div>
);

const QuickActionCard = ({ title, description, buttonText, onClick, color = "blue" }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    <button
      onClick={onClick}
      className={`w-full bg-${color}-600 text-white py-2 px-4 rounded-md hover:bg-${color}-700 transition-colors`}
    >
      {buttonText}
    </button>
  </div>
);

const RecentTransaction = ({ transaction, userCurrency }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'income' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className={`text-sm font-medium ${
        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, userCurrency)}
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
    if (isOverdue) return 'text-red-600';
    if (isDueToday) return 'text-orange-600';
    if (diffDays <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getTimeText = () => {
    if (isOverdue) return `${Math.abs(diffDays)} days overdue`;
    if (isDueToday) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
        {reminder.amount && (
          <p className="text-xs text-gray-500">{formatCurrency(reminder.amount, userCurrency)}</p>
        )}
      </div>
      <div className={`text-xs font-medium ${getUrgencyColor()}`}>
        {getTimeText()}
      </div>
    </div>
  );
};const DashboardOverview = ({ onNavigate }) => {
  const { 
    budgets, 
    goals, 
    reminders, 
    dashboardData,
    fetchDashboardData,
    fetchBudgets,
    fetchGoals, 
    fetchReminders,
    refreshAllData,
    loading 
  } = useDashboard();

  const { user } = useContext(UserContext);
  const userCurrency = user?.defaultCurrency || 'USD';

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    budgetUsage: 0,
    totalSavingsFromGoals: 0,
    upcomingDues: 0,
    totalGoalTarget: 0,
    totalGoalProgress: 0,
    remainingBudget: 0,
    netWorth: 0,
    totalBudget: 0
  });

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchBudgets(),
        fetchGoals(),
        fetchReminders()
      ]);
    };
    fetchAllData();
  }, []);

  // Auto-refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardData]);

  useEffect(() => {
    // Use real dashboard data when available
    if (dashboardData) {
      setFinancialSummary({
        totalIncome: dashboardData.totalIncome || 0,
        totalExpenses: dashboardData.totalExpense || 0,
        netAmount: dashboardData.totalBalance || 0,
        budgetUsage: 0 // Will be calculated separately
      });

      // Set recent transactions from API data
      if (dashboardData.recentTransactions) {
        const formattedTransactions = dashboardData.recentTransactions.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          description: transaction.type === 'income' ? transaction.source : transaction.category,
          category: transaction.type === 'income' ? 'Income' : transaction.category,
          amount: transaction.amount,
          date: new Date(transaction.date)
        }));
        setRecentTransactions(formattedTransactions);
      }
    }
  }, [dashboardData]);

  useEffect(() => {
    if (!dashboardData) return; // Exit early if dashboardData is null
    
    // Ensure arrays are defined
    const safeGoals = goals || [];
    const safeBudgets = budgets || [];
    const safeReminders = reminders || [];
    
    // Calculate comprehensive financial metrics
    const totalBudget = safeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = safeBudgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
    const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Calculate total savings from completed goals
    const totalSavingsFromGoals = safeGoals
      .filter(goal => goal.completed)
      .reduce((sum, goal) => sum + (goal.progress || 0), 0);
    
    // Calculate upcoming dues (next 30 days)
    const upcomingDues = safeReminders
      .filter(reminder => !reminder.paid)
      .filter(reminder => {
        const dueDate = new Date(reminder.dueDate);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      })
      .reduce((sum, reminder) => sum + (reminder.amount || 0), 0);
    
    // Calculate active goal progress
    const totalGoalTarget = safeGoals
      .filter(goal => !goal.completed)
      .reduce((sum, goal) => sum + (goal.target || 0), 0);
    
    const totalGoalProgress = safeGoals
      .filter(goal => !goal.completed)
      .reduce((sum, goal) => sum + (goal.progress || 0), 0);
    
    // Calculate remaining budget
    const remainingBudget = totalBudget - totalSpent;
    
    // Calculate net worth (income - expenses + savings from goals)
    const netWorth = (dashboardData.totalIncome || 0) - (dashboardData.totalExpense || 0) + totalSavingsFromGoals;

    setFinancialSummary(prev => ({
      ...prev,
      budgetUsage,
      totalSavingsFromGoals,
      upcomingDues,
      totalGoalTarget,
      totalGoalProgress,
      remainingBudget,
      netWorth,
      totalBudget
    }));
  }, [budgets, goals, reminders, dashboardData]);

  // Calculate budget alerts
  const budgetAlerts = (budgets || []).filter(budget => {
    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    return percentage >= 80;
  });

  // Get upcoming reminders (next 14 days)
  const upcomingReminders = (reminders || [])
    .filter(reminder => !reminder.paid)
    .filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();
      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 14; // Show reminders due within 14 days
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Calculate goal progress
  const activeGoals = (goals || []).filter(goal => !goal.completed);
  const completedGoals = (goals || []).filter(goal => goal.completed);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Here's your financial overview</p>
          </div>
          <button
            onClick={refreshAllData}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2 self-start sm:self-auto"
            title="Refresh dashboard data"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Primary Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(financialSummary.totalIncome, userCurrency)}
          subtitle="This month"
          color="green"
          icon="💰"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financialSummary.totalExpenses, userCurrency)}
          subtitle="This month"
          color="red"
          icon="💸"
        />
        <StatCard
          title="Net Amount"
          value={formatCurrency(financialSummary.netAmount, userCurrency)}
          subtitle="Income - Expenses"
          color={financialSummary.netAmount >= 0 ? "green" : "red"}
          icon="📊"
        />
        <StatCard
          title="Savings Goals"
          value={formatCurrency(financialSummary.totalSavingsFromGoals, userCurrency)}
          subtitle={`${completedGoals.length}/${goals?.length || 0} goals completed`}
          color="purple"
          icon="🎯"
        />
      </div>

      {/* Secondary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Budget Usage"
          value={`${financialSummary.budgetUsage.toFixed(1)}%`}
          subtitle={`${budgetAlerts.length} budget${budgetAlerts.length !== 1 ? 's' : ''} over 80%`}
          color={financialSummary.budgetUsage > 80 ? "red" : "blue"}
          icon="📋"
        />
        <StatCard
          title="Upcoming Dues"
          value={formatCurrency(financialSummary.upcomingDues, userCurrency)}
          subtitle="Next 30 days"
          color="orange"
          icon="⏰"
        />
        <StatCard
          title="Goal Progress"
          value={formatCurrency(financialSummary.totalGoalProgress, userCurrency)}
          subtitle={`${((financialSummary.totalGoalProgress / (financialSummary.totalGoalTarget || 1)) * 100).toFixed(1)}% of target`}
          color="indigo"
          icon="�"
        />
        <StatCard
          title="Available Budget"
          value={formatCurrency(financialSummary.remainingBudget, userCurrency)}
          subtitle={`Of ${formatCurrency(financialSummary.totalBudget, userCurrency)} total`}
          color={financialSummary.remainingBudget >= 0 ? "green" : "red"}
          icon="💳"
        />
      </div>

      {/* Enhanced Net Worth Card */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-100">Total Net Worth</p>
              <p className="text-3xl font-bold mb-2">{formatCurrency(financialSummary.netWorth, userCurrency)}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-100">
                <div>
                  <span className="font-medium">Income:</span> {formatCurrency(financialSummary.totalIncome, userCurrency)}
                </div>
                <div>
                  <span className="font-medium">Expenses:</span> -{formatCurrency(financialSummary.totalExpenses, userCurrency)}
                </div>
                <div>
                  <span className="font-medium">Savings Goals:</span> {formatCurrency(financialSummary.totalSavingsFromGoals, userCurrency)}
                </div>
              </div>
              {/* Financial Health Indicator */}
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Financial Health:</span>
                  <div className="flex-1 bg-blue-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        financialSummary.netAmount >= 0 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(10, ((financialSummary.netAmount / (financialSummary.totalIncome || 1)) * 100) + 50))}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm">
                    {financialSummary.netAmount >= 0 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-4xl ml-4">💎</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickActionCard
          title="Add Income"
          description="Record a new income transaction"
          buttonText="Add Income"
          onClick={() => onNavigate?.('/income')}
          color="green"
        />
        <QuickActionCard
          title="Add Expense"
          description="Record a new expense"
          buttonText="Add Expense"
          onClick={() => onNavigate?.('/expenses')}
          color="red"
        />
        <QuickActionCard
          title="Create Budget"
          description="Set up a new budget category"
          buttonText="Create Budget"
          onClick={() => onNavigate?.('/dashboard/budgets')}
          color="blue"
        />
        <QuickActionCard
          title="Set Goal"
          description="Create a new financial goal"
          buttonText="Set Goal"
          onClick={() => onNavigate?.('/dashboard/goals')}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => onNavigate?.('/dashboard/transactions')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          {(recentTransactions || []).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent transactions</p>
          ) : (
            <div className="space-y-0">
              {(recentTransactions || []).map((transaction) => (
                <RecentTransaction key={transaction.id} transaction={transaction} userCurrency={userCurrency} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h3>
            <button
              onClick={() => onNavigate?.('/dashboard/reminders')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          {(upcomingReminders || []).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming reminders</p>
          ) : (
            <div className="space-y-0">
              {(upcomingReminders || []).map((reminder) => (
                <UpcomingReminder key={reminder.id} reminder={reminder} userCurrency={userCurrency} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goals and Budget Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
            <button
              onClick={() => onNavigate?.('/dashboard/goals')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Manage Goals
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Summary</h3>
            <button
              onClick={() => onNavigate?.('/dashboard/budgets')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Manage Budgets
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{budgets.length}</p>
              <p className="text-sm text-gray-600">Active Budgets</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{budgetAlerts.length}</p>
              <p className="text-sm text-gray-600">Over 80%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardOverviewWithErrorBoundary = () => (
  <ErrorBoundary fallback={DashboardErrorFallback}>
    <DashboardOverview />
  </ErrorBoundary>
);

export default DashboardOverviewWithErrorBoundary;
