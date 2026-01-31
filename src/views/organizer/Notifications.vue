<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-h2 font-bold mb-2">
          Notifications
        </h1>
        <p class="text-muted-foreground">
          {{ unreadCount }} unread
        </p>
      </div>
      <button
        v-if="unreadCount > 0"
        class="btn-outline px-6 py-2"
        @click="markAllRead"
      >
        Mark All as Read
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-muted-foreground">Loading notifications...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 border border-destructive bg-destructive/10 rounded-lg">
      <p class="text-destructive">
        {{ typeof error === 'string' ? error : (error.response?.data?.error || error.message || 'An error occurred') }}
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="notifications.length === 0" class="text-center py-12">
      <div class="text-4xl mb-4">🔔</div>
      <p class="text-muted-foreground">No notifications yet</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['p-4 border rounded-lg transition-colors cursor-pointer hover:bg-muted', !notification.isRead ? 'border-primary bg-primary/5' : 'border-border']"
        @click="toggleRead(notification.id)"
      >
        <div class="flex items-start gap-4">
          <div class="text-2xl">
            {{ getNotificationIcon(notification.type) }}
          </div>
          <div class="flex-1">
            <p class="font-semibold">
              {{ notification.title }}
            </p>
            <p class="text-muted-foreground text-sm mt-1">
              {{ notification.message }}
            </p>
            <p class="text-xs text-muted-foreground mt-2">
              {{ formatTimestamp(notification.createdAt) }}
            </p>
          </div>
          <div
            v-if="!notification.isRead"
            class="flex-shrink-0 w-2 h-2 bg-primary rounded-full"
          />
        </div>
      </div>
    </div>

    <!-- Error Notification -->
    <ErrorNotification
      :show="showError"
      :title="errorTitle"
      :type="errorType"
      :message="errorMessage"
      :detail="errorDetail"
      :status-code="errorStatusCode"
      @close="closeError"
    />
  </div>
</template>


<script setup>
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import ErrorNotification from '@/components/ErrorNotification.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()

const notificationStore = useNotificationStore()
const router = useRouter()

// Computed properties from store
const notifications = computed(() => notificationStore.sortedNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const loading = computed(() => notificationStore.loading)
const error = computed(() => notificationStore.error)

// Fetch notifications on mount
onMounted(async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (err) {
    displayError(err, 'Failed to load notifications')
  }
})

// Map notification type to icon
const getNotificationIcon = (type) => {
  const iconMap = {
    General: '📢',
    BookingConfirmed: '✅',
    PaymentReminder: '💰',
    EventCancelled: '❌',
    EventStartingSoon: '⏰',
    FeedbackReply: '💬',
    BookingCancelled: '🚫',
  }
  return iconMap[type] || '📢'
}

// Format timestamp to relative time
const formatTimestamp = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return date.toLocaleDateString()
}

// Toggle read status
const toggleRead = async (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && !notification.isRead) {
    try {
      await notificationStore.markAsRead(id)
    } catch (err) {
      displayError(err, 'Failed to mark as read')
    }
  }
  
  // Navigate if referenceKey exists (e.g. for event feedback)
  if (notification?.referenceKey) {
     router.push(`/organizer/events/${notification.referenceKey}?tab=feedback`)
  }
}

// Mark all as read
const markAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (err) {
    displayError(err, 'Failed to mark all as read')
  }
}
</script>

