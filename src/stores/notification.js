import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as signalR from "@microsoft/signalr";
import apiClient from "../services/api"; // Assuming you have an axios instance
import { useAuthStore } from "./auth";
import { useToast } from "vue-toastification";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const connection = ref(null);
  const isConnected = ref(false);

  const authStore = useAuthStore();
  const toast = useToast();

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  });

  // Fetch initial notifications from API
  const fetchNotifications = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get("/Notification/user");
      notifications.value = response.data;
      updateUnreadCount();
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      error.value = "Failed to load notifications";
    } finally {
      loading.value = false;
    }
  };

  // Initialize SignalR Connection
  const connect = async () => {
    if (connection.value || !authStore.token) return;

    const hubUrl =
      "https://convene-backend-7whb.onrender.com/hubs/notifications"; // Configure as needed

    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => authStore.token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.value.on("ReceiveNotification", (notification) => {
      console.log("New Notification Received (Raw):", notification);

      const title = notification.title || notification.Title;
      const message = notification.message || notification.Message;
      const type = notification.type || notification.Type;
      const createdAt = notification.createdAt || notification.CreatedAt;
      const referenceKey =
        notification.referenceKey || notification.ReferenceKey;

      // Trigger Toast
      const toastContent = message || title || "New Notification";
      toast.info(toastContent, {
        timeout: 5000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: "button",
        icon: true,
        rtl: false,
      });

      // Normalize data if necessary to match API format
      const newNotif = {
        id: crypto.randomUUID(), // distinct ID for UI if backend doesn't send one for realtime
        title: title,
        message: message,
        type: type,
        createdAt: createdAt,
        isRead: false,
        referenceKey: referenceKey, // Include reference key if available
      };
      notifications.value.unshift(newNotif);
      updateUnreadCount();
    });

    try {
      await connection.value.start();
      isConnected.value = true;
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      isConnected.value = false;
    }
  };

  const disconnect = async () => {
    if (connection.value) {
      await connection.value.stop();
      connection.value = null;
      isConnected.value = false;
    }
  };

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      const notif = notifications.value.find((n) => n.id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        updateUnreadCount();
        await apiClient.post(`/Notification/${id}/read`);
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all as read locally (optimistic update)
      notifications.value.forEach((n) => {
        if (!n.isRead) {
          n.isRead = true;
        }
      });
      updateUnreadCount();

      // Call backend to mark all as read
      // Note: You may need to add this endpoint to the backend if it doesn't exist
      // For now, we'll mark them individually
      // ask nati if this feature is implemented in the backend
      const unreadIds = notifications.value
        .filter((n) => n.id)
        .map((n) => n.id);

      for (const id of unreadIds) {
        try {
          await apiClient.post(`/Notification/${id}/read`);
        } catch (err) {
          console.error(`Failed to mark notification ${id} as read:`, err);
        }
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter((n) => !n.isRead).length;
  };

  return {
    notifications,
    sortedNotifications,
    unreadCount,
    loading,
    error,
    isConnected,
    connect,
    disconnect,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
});
