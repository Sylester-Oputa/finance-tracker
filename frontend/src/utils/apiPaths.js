export const BASE_URL = "http://localhost:5500";

// API Paths
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
    VERIFY_EMAIL: (token) => `/api/v1/auth/verify-email/${token}`,
    RESEND_VERIFICATION: "/api/v1/auth/resend-verification",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
    REFRESH_TOKEN: "/api/v1/auth/refresh-token",
    LOGOUT: "/api/v1/auth/logout",
    LOGOUT_ALL: "/api/v1/auth/logout-all",
    UPDATE_PROFILE: "/api/v1/auth/update-profile",
    DELETE_ACCOUNT: "/api/v1/auth/delete-account",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
    CATEGORIES_BREAKDOWN: "/api/v1/dashboard/categories-breakdown",
    BUDGETS: "/api/v1/dashboard/budgets",
    CREATE_BUDGET: "/api/v1/dashboard/budgets",
    UPDATE_BUDGET: (id) => `/api/v1/dashboard/budgets/${id}`,
    DELETE_BUDGET: (id) => `/api/v1/dashboard/budgets/${id}`,
    BUDGET_STATUS: "/api/v1/dashboard/budgets/status",
    GOALS: "/api/v1/dashboard/goals",
    CREATE_GOAL: "/api/v1/dashboard/goals",
    UPDATE_GOAL: (id) => `/api/v1/dashboard/goals/${id}`,
    DELETE_GOAL: (id) => `/api/v1/dashboard/goals/${id}`,
    GOAL_PROGRESS: "/api/v1/dashboard/goals/progress",
    ADD_GOAL_PROGRESS: (id) => `/api/v1/dashboard/goals/${id}/add-progress`,
    REMOVE_GOAL_PROGRESS: (id) => `/api/v1/dashboard/goals/${id}/remove-progress`,
    REMINDERS: "/api/v1/dashboard/reminders",
    CREATE_REMINDER: "/api/v1/dashboard/reminders",
    UPDATE_REMINDER: (id) => `/api/v1/dashboard/reminders/${id}`,
    DELETE_REMINDER: (id) => `/api/v1/dashboard/reminders/${id}`,
    UPCOMING_REMINDERS: "/api/v1/dashboard/reminders/upcoming",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    GET: "/api/v1/income/get", // Backward compatibility
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DELETE: (incomeId) => `/api/v1/income/${incomeId}`, // Backward compatibility
    DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    GET: "/api/v1/expense/get", // Backward compatibility
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DELETE: (expenseId) => `/api/v1/expense/${expenseId}`, // Backward compatibility
    DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
};
