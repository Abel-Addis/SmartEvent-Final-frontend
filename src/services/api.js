import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://convene-backend-7whb.onrender.com/api", // Backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 10 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - only redirect if not already on the login page
      // This prevents immediate refresh on failed login attempts
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      !window.navigator.onLine
    ) {
      // Network error specific handling
      error.message =
        "No Internet Connection. Please check your network settings and try again.";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
