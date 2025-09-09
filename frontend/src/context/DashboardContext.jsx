import React, { createContext, useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [budgetAnalytics, setBudgetAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [categoriesBreakdown, setCategoriesBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard overview data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
      setDashboardData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories breakdown
  const fetchCategoriesBreakdown = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.CATEGORIES_BREAKDOWN);
      setCategoriesBreakdown(response.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories breakdown");
    }
  };

  // Budget operations
  const fetchBudgets = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.BUDGETS);
      setBudgets(response.data.budgets || []);
      return response.data.budgets || [];
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch budgets");
      console.error("Budgets fetch error:", err);
      setBudgets([]);
    }
  };

  // Fetch budget analytics for dashboard
  const fetchBudgetAnalytics = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.BUDGETS}/analytics`);
      setBudgetAnalytics(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch budget analytics");
      console.error("Budget analytics fetch error:", err);
      setBudgetAnalytics(null);
    }
  };

  const createBudget = async (budgetData) => {
    try {
      const response = await axiosInstance.post(API_PATHS.DASHBOARD.CREATE_BUDGET, budgetData);
      setBudgets(prev => [...prev, response.data.budget]);
      // Refresh dashboard data after creating budget
      await fetchDashboardData();
      return response.data.budget;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create budget");
      throw err;
    }
  };

  const updateBudget = async (id, budgetData) => {
    try {
      const response = await axiosInstance.put(API_PATHS.DASHBOARD.UPDATE_BUDGET(id), budgetData);
      setBudgets(prev => prev.map(budget => budget.id === id ? response.data.budget : budget));
      return response.data.budget;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update budget");
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.DASHBOARD.DELETE_BUDGET(id));
      setBudgets(prev => prev.filter(budget => budget.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete budget");
      throw err;
    }
  };

  // Goal operations
  const fetchGoals = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GOALS);
      setGoals(response.data.goals || []);
      return response.data.goals || [];
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch goals");
      console.error("Goals fetch error:", err);
      setGoals([]);
    }
  };

  const createGoal = async (goalData) => {
    try {
      const response = await axiosInstance.post(API_PATHS.DASHBOARD.CREATE_GOAL, goalData);
      setGoals(prev => [...prev, response.data.goal]);
      // Refresh dashboard data after creating goal
      await fetchDashboardData();
      return response.data.goal;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create goal");
      throw err;
    }
  };

  const updateGoal = async (id, goalData) => {
    try {
      const response = await axiosInstance.put(API_PATHS.DASHBOARD.UPDATE_GOAL(id), goalData);
      setGoals(prev => prev.map(goal => goal.id === id ? response.data.goal : goal));
      return response.data.goal;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update goal");
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.DASHBOARD.DELETE_GOAL(id));
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete goal");
      throw err;
    }
  };

  const addGoalProgress = async (id, amount) => {
    try {
      const response = await axiosInstance.post(API_PATHS.DASHBOARD.ADD_GOAL_PROGRESS(id), { amount });
      setGoals(prev => prev.map(goal => goal.id === id ? response.data.updatedGoal : goal));
      
      // Refresh dashboard data if goal is completed
      const updatedGoal = response.data.updatedGoal;
      const percentage = updatedGoal.target > 0 ? (updatedGoal.progress / updatedGoal.target) * 100 : 0;
      if (percentage >= 100) {
        await fetchDashboardData();
      }
      
      return updatedGoal;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add goal progress");
      throw err;
    }
  };

  const removeGoalProgress = async (id, amount) => {
    try {
      const response = await axiosInstance.post(API_PATHS.DASHBOARD.REMOVE_GOAL_PROGRESS(id), { amount });
      setGoals(prev => prev.map(goal => goal.id === id ? response.data.updatedGoal : goal));
      return response.data.updatedGoal;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove goal progress");
      throw err;
    }
  };

  const markGoalComplete = async (id) => {
    try {
      const response = await axiosInstance.patch(API_PATHS.DASHBOARD.GOALS + `/${id}/complete`);
      setGoals(prev => prev.map(goal => goal.id === id ? response.data.updatedGoal : goal));
      
      // Refresh dashboard data when goal is marked as completed
      await fetchDashboardData();
      
      return response.data.updatedGoal;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark goal as complete");
      throw err;
    }
  };

  // Reminder operations
  const fetchReminders = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.REMINDERS);
      setReminders(response.data.reminders || []);
      return response.data.reminders || [];
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reminders");
      console.error("Reminders fetch error:", err);
      setReminders([]);
    }
  };

  const createReminder = async (reminderData) => {
    try {
      const response = await axiosInstance.post(API_PATHS.DASHBOARD.CREATE_REMINDER, reminderData);
      setReminders(prev => [...prev, response.data.reminder]);
      // Refresh all dashboard data after creating reminder
      await Promise.all([fetchDashboardData(), fetchReminders()]);
      return response.data.reminder;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reminder");
      throw err;
    }
  };

  const updateReminder = async (id, reminderData) => {
    try {
      const response = await axiosInstance.put(API_PATHS.DASHBOARD.UPDATE_REMINDER(id), reminderData);
      setReminders(prev => prev.map(reminder => reminder.id === id ? response.data.reminder : reminder));
      return response.data.reminder;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update reminder");
      throw err;
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.DASHBOARD.DELETE_REMINDER(id));
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete reminder");
      throw err;
    }
  };

  // Refresh all dashboard data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchBudgets(),
        fetchGoals(),
        fetchReminders(),
        fetchCategoriesBreakdown()
      ]);
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear all data (useful for logout)
  const clearDashboardData = () => {
    setDashboardData(null);
    setBudgets([]);
    setGoals([]);
    setReminders([]);
    setCategoriesBreakdown([]);
    setError(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        // State
        dashboardData,
        budgets,
        budgetAnalytics,
        goals,
        reminders,
        categoriesBreakdown,
        loading,
        error,
        
        // Actions
        fetchDashboardData,
        fetchCategoriesBreakdown,
        fetchBudgets,
        fetchBudgetAnalytics,
        createBudget,
        updateBudget,
        deleteBudget,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        addGoalProgress,
        removeGoalProgress,
        markGoalComplete,
        fetchReminders,
        createReminder,
        updateReminder,
        deleteReminder,
        refreshAllData,
        clearDashboardData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
