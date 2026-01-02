import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { notificationService } from "../services/notificationService";

export const useNotificationStore = defineStore("notification", () => {
  // State
  const notifications = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.isRead).length
  );

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.isRead)
  );

  const sortedNotifications = computed(() =>
    [...notifications.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  );

  // Actions
  async function fetchNotifications() {
    loading.value = true;
    error.value = null;

    try {
      const response = await notificationService.getUserNotifications();
      notifications.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch notifications";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(id) {
    try {
      await notificationService.markAsRead(id);

      // Update local state
      const notification = notifications.value.find((n) => n.id === id);
      if (notification) {
        notification.isRead = true;
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to mark notification as read";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    }
  }

  async function markAllAsRead() {
    try {
      // Mark all unread notifications as read
      const unread = notifications.value.filter((n) => !n.isRead);

      await Promise.all(
        unread.map((notification) =>
          notificationService.markAsRead(notification.id)
        )
      );

      // Update local state
      notifications.value.forEach((n) => {
        n.isRead = true;
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to mark all notifications as read";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    }
  }

  return {
    // State
    notifications,
    loading,
    error,
    // Getters
    unreadCount,
    unreadNotifications,
    sortedNotifications,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
});
