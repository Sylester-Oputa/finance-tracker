import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // 60s for cold starts
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor with Token Refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config || {};

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const response = await axios.post(`${BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem("token", accessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);

                    // Retry original request with new token
                    original.headers = original.headers || {};
                    original.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(original);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                window.location.href = "/login";
            }
        }

        // One-time retry on timeout (cold start) after a short warm-up ping
        if (error.code === "ECONNABORTED" && !original?._timeoutRetry) {
            try {
                original._timeoutRetry = true;
                await axios.get(`${BASE_URL}${API_PATHS.HEALTH}`, {
                    timeout: 3000,
                    params: { t: Date.now() },
                }).catch(() => {});
                // Extend timeout for the retry
                original.timeout = Math.max(original.timeout || 0, 60000);
                return axiosInstance(original);
            } catch (_) {
                // fall-through to rejection
            }
        }

        if (error.response?.status === 500) {
            console.error("Server error. Please try again later.");
        }

        if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Try again later.");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
