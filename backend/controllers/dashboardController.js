const prisma = require("../config/db");

// Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch total income & expense
    const totalIncomeAgg = await prisma.income.aggregate({
      _sum: { amount: true },
      where: { userId },
    });
    const totalExpenseAgg = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { userId },
    });

    const totalIncome = totalIncomeAgg._sum.amount || 0;
    const totalExpense = totalExpenseAgg._sum.amount || 0;

    // Get income transactions for last 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const last60daysIncomeTransactions = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: sixtyDaysAgo },
      },
      orderBy: { date: "desc" },
    });
    const incomeLast60Days = last60daysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last30daysExpenseTransactions = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "desc" },
    });
    const expenseLast30Days = last30daysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // fetch last 5 transactions (income + expense)
    const last5Income = await prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    });
    const last5Expense = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    });
    const lastTransactions = [
      ...last5Income.map((txn) => ({ ...txn, type: "income" })),
      ...last5Expense.map((txn) => ({ ...txn, type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); //Sort latest first

    // Final response
    res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      last30DaysExpenses: {
        total: expenseLast30Days,
        transactions: last30daysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60daysIncomeTransactions,
      },
      recentTransactions: lastTransactions,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get spending categories breakdown
exports.getCategoriesBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const breakdown = await prisma.expense.groupBy({
      by: ["category"],
      where: { userId },
      _sum: { amount: true },
      orderBy: { category: "asc" },
    });
    res.json({ categories: breakdown });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get all budgets for user with real spending data
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await prisma.budget.findMany({ where: { userId } });
    
    // Calculate real spending for each budget
    const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
      const spent = await calculateBudgetSpending(userId, budget);
      return {
        ...budget,
        spent: spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
        remaining: budget.amount - spent,
        status: spent > budget.amount ? 'over' : spent > (budget.amount * 0.8) ? 'warning' : 'good'
      };
    }));
    
    res.json({ budgets: budgetsWithSpending });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Helper function to calculate actual spending for a budget
const calculateBudgetSpending = async (userId, budget) => {
  const now = new Date();
  let dateFilter = {};
  
  switch (budget.period.toLowerCase()) {
    case 'weekly':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = { gte: startOfWeek };
      break;
      
    case 'monthly':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: startOfMonth };
      break;
      
    case 'yearly':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { gte: startOfYear };
      break;
      
    default:
      // Default to monthly if period is unknown
      const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: defaultStartOfMonth };
  }
  
  const spent = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      category: budget.category,
      date: dateFilter,
    },
  });
  
  return spent._sum.amount || 0;
};

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, period } = req.body;
    const budget = await prisma.budget.create({
      data: { userId, category, amount, period },
    });
    res.status(201).json({ budget });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category, amount, period } = req.body;
    const budget = await prisma.budget.update({
      where: { id, userId },
      data: { category, amount, period },
    });
    res.json({ budget });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await prisma.budget.delete({ where: { id, userId } });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get budget status (spend vs. budget) - Enhanced with real data
exports.getBudgetStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await prisma.budget.findMany({ where: { userId } });
    
    const status = await Promise.all(budgets.map(async (budget) => {
      const spent = await calculateBudgetSpending(userId, budget);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        id: budget.id,
        category: budget.category,
        budget: budget.amount,
        spent: spent,
        remaining: budget.amount - spent,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        period: budget.period,
        status: spent > budget.amount ? 'over' : percentage > 80 ? 'warning' : 'good',
        isOverBudget: spent > budget.amount,
        isNearLimit: percentage > 80 && spent <= budget.amount,
      };
    }));
    
    // Calculate overall budget health
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = status.reduce((sum, stat) => sum + stat.spent, 0);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const budgetsOverLimit = status.filter(s => s.status === 'over').length;
    const budgetsNearLimit = status.filter(s => s.status === 'warning').length;
    
    res.json({ 
      status,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        budgetsOverLimit,
        budgetsNearLimit,
        overallStatus: overallPercentage > 100 ? 'over' : overallPercentage > 80 ? 'warning' : 'good'
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get all goals for user
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await prisma.goal.findMany({ where: { userId } });
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, target, deadline } = req.body;
    const goal = await prisma.goal.create({
      data: { userId, name, target, deadline },
    });
    res.status(201).json({ goal });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, target, progress, deadline } = req.body;
    const goal = await prisma.goal.update({
      where: { id, userId },
      data: { name, target, progress, deadline },
    });
    res.json({ goal });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await prisma.goal.delete({ where: { id, userId } });
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get goal progress
exports.getGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await prisma.goal.findMany({ where: { userId } });
    const progress = goals.map((goal) => ({
      name: goal.name,
      target: goal.target,
      progress: goal.progress,
      percent: goal.target
        ? Math.round((goal.progress / goal.target) * 100)
        : 0,
      deadline: goal.deadline,
    }));
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get all reminders for user
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await prisma.reminder.findMany({ where: { userId } });
    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, dueDate, amount } = req.body;
    const reminder = await prisma.reminder.create({
      data: { userId, title, dueDate, amount },
    });
    res.status(201).json({ reminder });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, dueDate, amount, paid } = req.body;
    const reminder = await prisma.reminder.update({
      where: { id, userId },
      data: { title, dueDate, amount, paid },
    });
    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await prisma.reminder.delete({ where: { id, userId } });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get upcoming reminders (next 30 days)
exports.getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        dueDate: { gte: now, lte: thirtyDaysLater },
        paid: false,
      },
      orderBy: { dueDate: "asc" },
    });
    res.json({ upcoming: reminders });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Add progress to a goal
exports.addGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number." });
    }
    const goal = await prisma.goal.findUnique({ where: { id, userId } });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }
    
    const newProgress = goal.progress + Number(amount);
    const isCompleted = newProgress >= goal.target;
    
    const updatedGoal = await prisma.goal.update({
      where: { id, userId },
      data: { 
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : goal.completedAt
      },
    });
    res.json({ updatedGoal });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Remove progress from a goal
exports.removeGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number." });
    }
    const goal = await prisma.goal.findUnique({
      where: { id, userId },
    });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }
    const newProgress = Math.max(goal.progress - Number(amount), 0);
    const isCompleted = newProgress >= goal.target;
    
    const updatedGoal = await prisma.goal.update({
      where: { id, userId },
      data: { 
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? (goal.completedAt || new Date()) : null
      },
    });
    res.json({ updatedGoal });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Mark goal as complete
exports.markGoalComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const goal = await prisma.goal.findUnique({
      where: { id, userId },
    });
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }
    
    const updatedGoal = await prisma.goal.update({
      where: { id, userId },
      data: { 
        completed: true,
        completedAt: new Date(),
        progress: goal.target // Set progress to target when manually completed
      },
    });
    
    res.json({ updatedGoal });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Get budget analytics for dashboard
exports.getBudgetAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await prisma.budget.findMany({ where: { userId } });
    
    if (budgets.length === 0) {
      return res.json({
        totalBudget: 0,
        totalSpent: 0,
        overallUsage: 0,
        budgetAlerts: 0,
        status: 'no_budgets'
      });
    }
    
    const budgetAnalytics = await Promise.all(budgets.map(async (budget) => {
      const spent = await calculateBudgetSpending(userId, budget);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        id: budget.id,
        category: budget.category,
        amount: budget.amount,
        spent: spent,
        percentage: percentage,
        isAlert: percentage >= 80
      };
    }));
    
    const totalBudget = budgetAnalytics.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetAnalytics.reduce((sum, b) => sum + b.spent, 0);
    const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const budgetAlerts = budgetAnalytics.filter(b => b.isAlert).length;
    
    res.json({
      totalBudget,
      totalSpent,
      overallUsage: Math.round(overallUsage * 100) / 100,
      budgetAlerts,
      remaining: totalBudget - totalSpent,
      status: overallUsage > 100 ? 'over' : overallUsage > 80 ? 'warning' : 'good',
      budgets: budgetAnalytics
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};
