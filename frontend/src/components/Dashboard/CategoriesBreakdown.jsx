import React, { useEffect, useState, useContext } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { UserContext } from "../../context/UserContext";
import { useResponsive } from "../../hooks/useResponsive";
import ErrorBoundary from "../ErrorBoundary";
import { DashboardErrorFallback } from "../ErrorFallbacks";

const CategoryCard = ({ category, total, percentage, color, userCurrency }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency || 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900">{category}</h3>
        </div>
        <span className="text-sm lg:text-lg font-bold text-gray-900">
          {formatCurrency(total)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color 
          }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs lg:text-sm text-gray-500">
        <span>{percentage.toFixed(1)}% of total spending</span>
      </div>
    </div>
  );
};

const TransactionItem = ({ transaction, color, userCurrency }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency || 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        ></div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {transaction.description || transaction.category || 'Transaction'}
          </p>
          <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-900">
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  );
};

const PieChart = ({ data, size = 200 }) => {
  const center = size / 2;
  const radius = size * 0.4;
  
  let cumulativePercentage = 0;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item, index) => {
        const startAngle = (cumulativePercentage * 360 * Math.PI) / 180;
        const endAngle = ((cumulativePercentage + item.percentage) * 360 * Math.PI) / 180;
        
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        
        const largeArcFlag = item.percentage > 50 ? 1 : 0;
        
        const pathData = [
          `M ${center} ${center}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
        
        cumulativePercentage += item.percentage;
        
        return (
          <path
            key={item.category}
            d={pathData}
            fill={item.color}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

const CategoriesBreakdown = () => {
  const { budgets, expenses, loading, error } = useDashboard();
  const { user } = useContext(UserContext);
  const { isMobile, isTablet } = useResponsive();
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [totalSpending, setTotalSpending] = useState(0);

  const userCurrency = user?.currency || 'USD';

  // Color palette for categories
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
  ];

  useEffect(() => {
    if (!budgets && !expenses) return;

    // Group expenses by category
    const expensesByCategory = {};
    if (expenses && Array.isArray(expenses)) {
      expenses.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = [];
        }
        expensesByCategory[category].push(expense);
      });
    }

    // Calculate category data from real expenses and budgets
    const categories = [];
    
    // Add categories with expenses
    Object.keys(expensesByCategory).forEach((categoryName, index) => {
      const categoryExpenses = expensesByCategory[categoryName];
      const actualSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const budget = budgets?.find(b => b.category === categoryName);
      
      categories.push({
        category: categoryName,
        budgeted: budget?.amount || 0,
        spent: actualSpent,
        color: colors[index % colors.length],
        transactions: categoryExpenses.map(expense => ({
          id: expense.id || expense._id,
          description: expense.description || expense.category,
          amount: expense.amount,
          date: expense.date
        }))
      });
    });

    // Add budgets that don't have expenses
    if (budgets && Array.isArray(budgets)) {
      budgets.forEach((budget, index) => {
        if (!categories.find(cat => cat.category === budget.category)) {
          categories.push({
            category: budget.category,
            budgeted: budget.amount,
            spent: 0,
            color: colors[(categories.length + index) % colors.length],
            transactions: []
          });
        }
      });
    }

    const total = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const categoriesWithPercentage = categories.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.spent / total) * 100 : 0
    }));

    setCategoryData(categoriesWithPercentage);
    setTotalSpending(total);
  }, [budgets, expenses]);

  const pieChartData = categoryData
    .filter(cat => cat.spent > 0)
    .map(cat => ({
      category: cat.category,
      percentage: cat.percentage / 100,
      color: cat.color
    }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <DashboardErrorFallback error={error} retry={() => window.location.reload()} />;
  }

  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Spending Categories</h2>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            {pieChartData.length > 0 ? (
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Spending Distribution</h3>
                <PieChart data={pieChartData} size={isMobile ? 150 : 200} />
                <p className="mt-4 text-sm text-gray-600">
                  Total Spending: {formatCurrency(totalSpending)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No spending data available</p>
              </div>
            )}

            {/* Top Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
              <div className="space-y-3">
                {categoryData.slice(0, 6).map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.spent)}</p>
                      <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        {categoryData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryData.map((category) => (
              <CategoryCard
                key={category.category}
                category={category.category}
                total={category.spent}
                percentage={category.percentage}
                color={category.color}
                userCurrency={userCurrency}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
              <p className="text-gray-600">Start by creating budgets and adding expenses to see your spending breakdown.</p>
            </div>
          </div>
        )}

        {/* Category Detail Modal */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{selectedCategory.category} Transactions</h3>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {selectedCategory.transactions.length > 0 ? (
                    selectedCategory.transactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        color={selectedCategory.color}
                        userCurrency={userCurrency}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No transactions in this category</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CategoriesBreakdown;
