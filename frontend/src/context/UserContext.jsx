import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { handleApiError } from "../utils/errorHandler";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Enhanced token validation
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      // Parse JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      setAuthError(null);
      
      const token = localStorage.getItem("token");
      
      if (!token || !isTokenValid(token)) {
        // No token or invalid token, try to refresh
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          clearUser();
          setLoading(false);
          return;
        }
      }

      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
        setUser(response.data);
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (error) {
        const errorMessage = handleApiError(error);
        setAuthError(errorMessage);
        
        // If user info fetch fails, try refreshing token once more
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          try {
            const retryResponse = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
            setUser(retryResponse.data);
            setIsAuthenticated(true);
            setAuthError(null);
          } catch (retryError) {
            clearUser();
          }
        } else {
          clearUser();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isTokenValid]);

  // Function to update user data
  const updateUser = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthError(null);
  }, []);

  // Function to clear user data (e.g. on logout)
  const clearUser = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, []);

  // Function to handle logout
  const logout = useCallback(async (logoutAll = false) => {
    try {
      const endpoint = logoutAll ? API_PATHS.AUTH.LOGOUT_ALL : API_PATHS.AUTH.LOGOUT;
      await axiosInstance.post(endpoint);
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      clearUser();
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [clearUser]);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      clearUser();
      return false;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REFRESH_TOKEN, {
        refreshToken: storedRefreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem("token", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearUser();
      return false;
    }
  }, [clearUser]);

  // Function to handle login
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, credentials);
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;
      
      localStorage.setItem("token", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = handleApiError(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        authError,
        updateUser,
        clearUser,
        logout,
        refreshToken,
        login,
        isTokenValid,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
