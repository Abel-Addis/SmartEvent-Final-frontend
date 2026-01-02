import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/authService";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);
  const isOrganizer = computed(() => user.value?.role === "Organizer");
  const isAttendee = computed(() => user.value?.role === "Attendee");
  const isAdmin = computed(() => user.value?.role === "Admin");

  // Actions
  async function login(credentials) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        // Store token and user data
        console.log("response:", response);
        token.value = response.token;
        user.value = {
          fullName: response.fullName,
          email: response.email,
          phoneNumber: response.phoneNumber,
          role: response.role,
          status: response.status,
          id: response.userId
        };

        // Persist to localStorage
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(user.value));

        return { success: true, user: user.value };
      } else {
        error.value = response.message || "Login failed";
        return { success: false, message: error.value };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function registerAttendee(userData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.registerAttendee(userData);

      if (response.success) {
        token.value = response.token;
        user.value = {
          fullName: response.fullName,
          email: response.email,
          phoneNumber: response.phoneNumber,
          role: response.role,
          status: response.status,
          id: response.userId
        };

        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(user.value));

        return { success: true, user: user.value };
      } else {
        error.value = response.message || "Registration failed";
        return { success: false, message: error.value };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function registerOrganizer(formData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.registerOrganizer(formData);

      if (response.success) {
        token.value = response.token;
        user.value = {
          fullName: response.fullName,
          email: response.email,
          phoneNumber: response.phoneNumber,
          role: response.role,
          status: response.status,
          id: response.userId
        };

        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(user.value));

        return { success: true, user: user.value };
      } else {
        error.value = response.message || "Registration failed";
        return { success: false, message: error.value };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  const router = useRouter();

  function logout() {
    user.value = null;
    token.value = null;
    error.value = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
  }

  function initializeAuth() {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  }

  // Initialize auth state from localStorage
  initializeAuth();

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    isOrganizer,
    isAttendee,
    isAdmin,
    // Actions
    login,
    registerAttendee,
    registerOrganizer,
    logout,
    initializeAuth,
  };
});
