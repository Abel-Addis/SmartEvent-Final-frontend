<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-h2 font-bold">Notifications</h1>
      <div class="flex gap-2">
        <button 
          v-if="sortedNotifications.some(n => !n.isRead)"
          @click="markAllRead" 
          class="text-sm text-primary hover:underline px-3 py-2"
        >
          Mark all as read
        </button>
        <button @click="loadNotifications" class="btn-outline p-2" title="Refresh">
          🔄
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-muted-foreground">
      Loading notifications...
    </div>

    <div v-else-if="sortedNotifications.length === 0" class="text-center py-16 bg-muted/30 rounded-lg">
      <div class="text-4xl mb-4">🔕</div>
      <p class="text-muted-foreground">You have no notifications yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="notif in sortedNotifications" 
        :key="notif.id"
        :class="[
          'card transition-all hover:shadow-md border-l-4',
          notif.isRead ? 'border-l-border bg-background' : 'border-l-primary bg-primary/5'
        ]"
      >
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary inline-block"></span>
              <h3 :class="['font-semibold', notif.isRead ? 'text-foreground/80' : 'text-foreground']">
                {{ notif.title }}
              </h3>
              <span class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                {{ notif.type }}
              </span>
            </div>
            <p class="text-sm text-foreground/80 leading-relaxed">{{ notif.message }}</p>
            <p class="text-xs text-muted-foreground mt-2">{{ formatDate(notif.createdAt) }}</p>
          </div>
          
          <button 
            v-if="!notif.isRead" 
            @click="markRead(notif.id)"
            class="text-xs text-primary hover:underline whitespace-nowrap"
          >
            Mark as read
          </button>
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
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'
import ErrorNotification from '@/components/ErrorNotification.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()

const notificationStore = useNotificationStore()
const { sortedNotifications, loading } = storeToRefs(notificationStore)

const loadNotifications = async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (err) {
    displayError(err, 'Failed to load notifications')
  }
}

const markRead = async (id) => {
  try {
    await notificationStore.markAsRead(id)
  } catch (err) {
    displayError(err, 'Failed to mark as read')
  }
}

const markAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    displayError('All notifications marked as read', 'Success', 'success')
  } catch (err) {
    displayError(err, 'Failed to mark all as read')
  }
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

onMounted(() => {
    loadNotifications()
})
</script>
