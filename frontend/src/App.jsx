import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ResendVerification from "./pages/Auth/ResendVerification";
import Home from "./pages/Dashboard/Home";
import Income from "./pages/Dashboard/Income";
import Expenses from "./pages/Dashboard/Expenses";
import Transactions from "./pages/Dashboard/Transactions";
import Budgets from "./pages/Dashboard/Budgets";
import Goals from "./pages/Dashboard/Goals";
import Reminders from "./pages/Dashboard/Reminders";
import Categories from "./pages/Dashboard/Categories";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import UserProvider from "./context/UserContext";
import ThemeProvider from "./context/ThemeContext";
import CurrencyProvider from "./context/CurrencyContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import { NavigationErrorFallback, PageErrorFallback } from "./components/ErrorFallbacks";
import { ProtectedRoute, PublicRoute } from "./components/AuthGuards";

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <CurrencyProvider>
            <ErrorBoundary fallback={NavigationErrorFallback}>
              <Router>
                <Routes>
                  <Route path="/" element={<Root />} />
                  <Route 
                    path="/login" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/signup" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <PublicRoute>
                          <Signup />
                        </PublicRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/verify-email" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <VerifyEmail />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/verify-email/:token" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <VerifyEmail />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/forgot-password" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <PublicRoute>
                          <ForgotPassword />
                        </PublicRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/reset-password/:token" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <PublicRoute>
                          <ResetPassword />
                        </PublicRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/resend-verification" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ResendVerification />
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/income" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Income />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/expense" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Expenses />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/dashboard/transactions" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Transactions />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/dashboard/budgets" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Budgets />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/dashboard/goals" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Goals />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/dashboard/reminders" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Reminders />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/dashboard/categories" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Categories />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                  <Route 
                    path="/profile/security" 
                    element={
                      <ErrorBoundary fallback={PageErrorFallback}>
                        <ProtectedRoute>
                          <Security />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } 
                  />
                </Routes>
              </Router>
            </ErrorBoundary>

            <Toaster 
              toastOptions={{ 
                className: "", 
                style: { 
                  fontSize: "14px",
                  backgroundColor: "var(--color-cardBackground)",
                  color: "var(--color-textPrimary)",
                  border: "1px solid var(--color-borderCard)"
                } 
              }} 
            />
          </CurrencyProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

const Root = () => {
  // Check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  // Redirects to dashboard if authenticated is true, otherwise to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
