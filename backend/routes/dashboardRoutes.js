const express = require("express");
const {
  getDashboardData,
  getCategoriesBreakdown,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
  getBudgetAnalytics,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress,
  addGoalProgress,
  removeGoalProgress,
  markGoalComplete,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getUpcomingReminders,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDashboardData);
router.get("/categories-breakdown", protect, getCategoriesBreakdown);
router.get("/budgets", protect, getBudgets);
router.post("/budgets", protect, createBudget);
router.put("/budgets/:id", protect, updateBudget);
router.delete("/budgets/:id", protect, deleteBudget);
router.get("/budgets/status", protect, getBudgetStatus);
router.get("/budgets/analytics", protect, getBudgetAnalytics);
router.get("/goals", protect, getGoals);
router.post("/goals", protect, createGoal);
router.put("/goals/:id", protect, updateGoal);
router.delete("/goals/:id", protect, deleteGoal);
router.get("/goals/progress", protect, getGoalProgress);
router.post("/goals/:id/add-progress", protect, addGoalProgress);
router.post("/goals/:id/remove-progress", protect, removeGoalProgress);
router.patch("/goals/:id/complete", protect, markGoalComplete);
router.get("/reminders", protect, getReminders);
router.post("/reminders", protect, createReminder);
router.put("/reminders/:id", protect, updateReminder);
router.delete("/reminders/:id", protect, deleteReminder);
router.get("/reminders/upcoming", protect, getUpcomingReminders);

module.exports = router;
