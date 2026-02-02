<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-h2 font-bold">
        My Events
      </h1>
      <router-link to="/organizer/create-event" class="btn-primary px-6 py-2">
        Create Event
      </router-link>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 border-b border-border overflow-x-auto">
      <button v-for="filter in filters" :key="filter.value"
        :class="['px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap', activeFilter === filter.value ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground']"
        @click="activeFilter = filter.value">
        {{ filter.label }} ({{ filter.count }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <p class="text-muted-foreground">Loading events...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="card bg-destructive/10 border-destructive/20 text-destructive p-4">
      {{ typeof error === 'string' ? error : (error.response?.data?.error || error.message || 'An error occurred') }}
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredEvents.length === 0" class="card text-center py-12">
      <div class="text-4xl mb-4">📅</div>
      <h3 class="font-semibold mb-2">No Events Found</h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{ activeFilter === 'All' ? 'Create your first event to get started' : `No ${activeFilter.toLowerCase()} events`
        }}
      </p>
      <router-link v-if="activeFilter === 'All'" to="/organizer/create-event" class="btn-primary px-5 py-2">
        Create Event
      </router-link>
    </div>

    <!-- Events Table -->
    <div v-if="!loading && filteredEvents.length > 0" class="card overflow-hidden">
      <table class="w-full">
        <thead class="bg-muted border-b border-border">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold">
              Event
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold hidden sm:table-cell">
              Date
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold hidden md:table-cell">
              Capacity
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold">
              Status
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in filteredEvents" :key="event.eventId"
            class="border-b border-border hover:bg-muted/50 transition-colors">
            <td class="px-6 py-4">
              <p class="font-semibold">
                {{ event.title }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ event.categoryName }}
              </p>
            </td>
            <td class="px-6 py-4 hidden sm:table-cell text-sm">
              {{ formatDate(event.startDate) }}
            </td>
            <td class="px-6 py-4 hidden md:table-cell">
              {{ event.totalCapacity }}
            </td>
            <td class="px-6 py-4">
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(event)]">
                {{ event.status === 'Published' && new Date(event.endDate) < new Date() ? 'Finished' : event.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button v-if="event.status === 'Draft'" class="btn-primary text-xs px-3 py-1"
                  @click="openPublishModal(event)">
                  Publish
                </button>
                <router-link :to="`/organizer/events/${event.eventId}`" class="btn-outline text-xs px-3 py-1">
                  View
                </router-link>
                <router-link :to="`/organizer/events/${event.eventId}/edit`" class="btn-outline text-xs px-3 py-1">
                  Edit
                </router-link>
                <button v-if="event.status === 'Published'" class="btn-outline text-xs px-3 py-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400/30"
                  @click="handlePublishToTelegram(event)">
                  Telegram
                </button>
                <button v-if="event.status === 'Draft'" class="btn-outline text-xs px-3 py-1 text-destructive hover:bg-destructive/10"
                  @click="handleDeleteDraft(event)">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Publish Confirmation Modal -->
    <div v-if="showPublishModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closePublishModal">
      <div class="card max-w-md w-full">
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-h3">Publish Event</h3>
            <button class="text-muted-foreground hover:text-foreground" @click="closePublishModal">✕</button>
          </div>

          <p class="text-sm text-muted-foreground">
            Are you sure you want to publish "{{ selectedEvent?.title }}"? This will make it visible to attendees.
          </p>

          <!-- Telegram Publishing Option -->
          <div class="border border-border rounded-lg p-4 bg-muted/20">
            <label class="flex items-start gap-3 cursor-pointer">
              <input v-model="postToTelegram" type="checkbox"
                class="mt-1 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0">
              <div>
                <span class="font-medium text-sm">Post to Telegram Channel</span>
                <p class="text-xs text-muted-foreground mt-1">
                  Share this event on our Telegram channel when publishing. This will help reach a wider audience.
                </p>
              </div>
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" class="btn-outline flex-1 py-2" @click="closePublishModal">
              Cancel
            </button>
            <button type="button" class="btn-primary flex-1 py-2" :disabled="publishing"
              @click="confirmPublish">
              <span v-if="publishing">Publishing...</span>
              <span v-else>Publish Event</span>
            </button>
          </div>
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

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      :type="confirmType"
      :confirm-text="confirmButtonText"
      :loading="confirmLoading"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { organizerService } from '@/services/organizerService'
import { eventService } from '@/services/eventService'
import ErrorNotification from '@/components/ErrorNotification.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'
import { useConfirmation } from '@/composables/useConfirmation'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()
const { showConfirm, confirmTitle, confirmMessage, confirmType, confirmLoading, confirmButtonText, askConfirmation, onConfirm, onCancel } = useConfirmation()

const activeFilter = ref('All')
const events = ref([])
const loading = ref(false)
const error = ref(null)
const showPublishModal = ref(false)
const selectedEvent = ref(null)
const postToTelegram = ref(false)
const publishing = ref(false)

// Filter definitions with counts
const filters = computed(() => {
  const now = new Date()
  const all = events.value.length
  
  // Published & Active (EndDate > Now)
  const published = events.value.filter(e => 
    e.status === 'Published' && new Date(e.endDate) > now
  ).length
  
  // Drafts
  const drafts = events.value.filter(e => e.status === 'Draft').length
  
  // Finished (Published & EndDate < Now)
  const finished = events.value.filter(e => 
    e.status === 'Published' && new Date(e.endDate) < now
  ).length

  return [
    { label: 'All', value: 'All', count: all },
    { label: 'Active', value: 'Active', count: published },
    { label: 'Drafts', value: 'Draft', count: drafts },
    { label: 'Finished', value: 'Finished', count: finished },
  ]
})

// Filtered events based on active filter
const filteredEvents = computed(() => {
  const now = new Date()
  
  if (activeFilter.value === 'All') return events.value
  
  if (activeFilter.value === 'Active') {
    return events.value.filter(e => e.status === 'Published' && new Date(e.endDate) > now)
  }
  
  if (activeFilter.value === 'Finished') {
    return events.value.filter(e => e.status === 'Published' && new Date(e.endDate) < now)
  }
  
  return events.value.filter(e => e.status === activeFilter.value)
})

// Fetch events
const fetchEvents = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await organizerService.getDashboardEvents()
    events.value = response
  } catch (err) {
    error.value = err
    displayError(err, 'Failed to load events')
  } finally {
    loading.value = false
  }
}

// Open publish modal
const openPublishModal = (event) => {
  selectedEvent.value = event
  postToTelegram.value = false
  showPublishModal.value = true
}

// Close publish modal
const closePublishModal = () => {
  showPublishModal.value = false
  selectedEvent.value = null
  postToTelegram.value = false
}

// Confirm publish with optional Telegram posting
const confirmPublish = async () => {
  if (!selectedEvent.value) return

  publishing.value = true
  error.value = null

  try {
    // First publish the event
    await eventService.publishEvent(selectedEvent.value.eventId)

    // If Telegram checkbox is checked, post to Telegram
    if (postToTelegram.value) {
      try {
        const id = selectedEvent.value.eventId || selectedEvent.value.EventId || selectedEvent.value.id;
        if (id) {
            await eventService.postEventToTelegram(id)
        } else {
            console.error("Could not find event ID for Telegram publishing");
        }
      } catch (telegramErr) {
        console.error('Failed to post to Telegram:', telegramErr)
        // Don't block the flow - event is already published
      }
    }

    // Refresh the events list
    await fetchEvents()
    closePublishModal()
    displayError('Event published successfully!', 'Success', 'success')
  } catch (err) {
    error.value = err
    displayError(err, 'Failed to publish event')
  } finally {
    publishing.value = false
  }
}

// Publish to Telegram
const handlePublishToTelegram = async (event) => {
  const confirmed = await askConfirmation({
    title: 'Publish to Telegram',
    message: `Are you sure you want to share "${event.title}" on the Telegram channel? This will help reach a wider audience.`,
    confirmText: 'Publish',
    type: 'primary'
  })

  if (!confirmed) return

  try {
    // Robustly get the ID
    const id = event.eventId || event.EventId || event.id;
    if (!id) throw new Error("Event ID not found");
    await eventService.postEventToTelegram(id)
    displayError('Event posted to Telegram successfully!', 'Success', 'success')
  } catch (err) {
    displayError(err, 'Failed to post to Telegram')
  }
}

// Delete draft event
const handleDeleteDraft = async (event) => {
  const confirmed = await askConfirmation({
    title: 'Delete Draft',
    message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
    type: 'danger',
    confirmText: 'Delete'
  })
  
  if (!confirmed) return

  try {
    await eventService.deleteDraftEvent(event.eventId)
    // Refresh the events list
    await fetchEvents()
    displayError('Draft deleted successfully', 'Deleted', 'success')
  } catch (err) {
    error.value = err
    displayError(err, 'Failed to delete event')
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Get status class
const getStatusClass = (event) => {
  const status = event.status
  const isFinished = status === 'Published' && new Date(event.endDate) < new Date()

  if (isFinished) {
    return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
  } else if (status === 'Published') {
    return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
  } else if (status === 'Draft') {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
  } else if (status === 'Cancelled') {
    return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
  }
  return 'bg-gray-100 text-gray-600'
}

// Fetch events on mount
onMounted(() => {
  fetchEvents()
})
</script>
