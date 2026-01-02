import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { adminService } from "../services/adminService";

export const useAdminStore = defineStore("admin", () => {
  // State
  const pendingOrganizers = ref([]);
  const allOrganizers = ref([]);
  const users = ref([]);
  const events = ref([]);
  const loading = ref(false);
  const usersLoading = ref(false); // dedicated loader for users list/filter
  const statusLoading = ref(false); // dedicated loader for status toggle
  const error = ref(null);

  // Pagination state
  const pendingOrganizersPagination = ref({
    totalCount: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize: 10,
  });
  const usersPagination = ref({
    totalCount: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize: 10,
  });

  // Getters
  const pendingOrganizersCount = computed(
    () => pendingOrganizersPagination.value.totalCount
  );
  const totalUsersCount = computed(() => usersPagination.value.totalCount);
  const totalEventsCount = computed(() => events.value.length);
  const activeOrganizersCount = computed(
    () => allOrganizers.value.filter((o) => o.status === "Active").length
  );

  // Actions
  async function fetchPendingOrganizers(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const response = await adminService.getPendingOrganizers(params);
      pendingOrganizers.value = response.items || [];
      pendingOrganizersPagination.value = {
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
      };
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch pending organizers";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllOrganizers(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const response = await adminService.getAllOrganizers(params);
      allOrganizers.value = response.items || [];
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch organizers";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function approveOrganizer(id, adminNotes = null) {
    loading.value = true;
    error.value = null;

    try {
      const response = await adminService.approveOrganizer(id, adminNotes);
      // Remove from pending list
      pendingOrganizers.value = pendingOrganizers.value.filter(
        (o) => o.id !== id
      );
      pendingOrganizersPagination.value.totalCount -= 1;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to approve organizer";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function rejectOrganizer(id, adminNotes = null) {
    loading.value = true;
    error.value = null;

    try {
      const response = await adminService.rejectOrganizer(id, adminNotes);
      // Remove from pending list
      pendingOrganizers.value = pendingOrganizers.value.filter(
        (o) => o.id !== id
      );
      pendingOrganizersPagination.value.totalCount -= 1;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to reject organizer";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllUsers(params = {}) {
    usersLoading.value = true;
    error.value = null;

    try {
      const response = await adminService.getAllUsers(params);
      users.value = response.items || [];
      usersPagination.value = {
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
      };
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch users";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      usersLoading.value = false;
    }
  }

  async function searchUsers(searchParams, pageParams = {}) {
    usersLoading.value = true;
    error.value = null;

    try {
      const response = await adminService.searchUsers(searchParams, pageParams);
      users.value = response.items || [];
      usersPagination.value = {
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
      };
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to search users";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      usersLoading.value = false;
    }
  }

  async function updateUserStatus(userId, isActive) {
    statusLoading.value = true;
    error.value = null;

    try {
      const response = await adminService.updateUserStatus(userId, isActive);
      // Update local state
      const user = users.value.find((u) => u.id === userId);
      if (user) {
        user.status = isActive ? "Active" : "Inactive";
      }
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update user status";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      statusLoading.value = false;
    }
  }

  async function fetchAllEvents() {
    loading.value = true;
    error.value = null;

    try {
      const response = await adminService.getAllEvents();
      events.value = response || [];
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch events";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    pendingOrganizers,
    allOrganizers,
    users,
    events,
    loading,
    usersLoading,
    statusLoading,
    error,
    pendingOrganizersPagination,
    usersPagination,
    // Getters
    pendingOrganizersCount,
    totalUsersCount,
    totalEventsCount,
    activeOrganizersCount,
    // Actions
    fetchPendingOrganizers,
    fetchAllOrganizers,
    approveOrganizer,
    rejectOrganizer,
    fetchAllUsers,
    searchUsers,
    updateUserStatus,
    fetchAllEvents,
  };
});
