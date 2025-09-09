import { useContext } from "react";
import { UserContext } from "../context/UserContext";

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  
  return context;
};

// Custom hook for protected routes
export const useAuthGuard = () => {
  const { isAuthenticated, loading } = useAuth();
  
  return {
    isAuthenticated,
    loading,
    canAccess: isAuthenticated && !loading,
  };
};
