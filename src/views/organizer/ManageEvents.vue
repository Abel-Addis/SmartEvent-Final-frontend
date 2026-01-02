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
      {{ error }}
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
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(event.status)]">
                {{ event.status }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { organizerService } from '@/services/organizerService'
import { eventService } from '@/services/eventService'

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
  const all = events.value.length
  const published = events.value.filter(e => e.status === 'Published').length
  const drafts = events.value.filter(e => e.status === 'Draft').length
  const cancelled = events.value.filter(e => e.status === 'Cancelled').length

  return [
    { label: 'All', value: 'All', count: all },
    { label: 'Published', value: 'Published', count: published },
    { label: 'Drafts', value: 'Draft', count: drafts },
    { label: 'Cancelled', value: 'Cancelled', count: cancelled },
  ]
})

// Filtered events based on active filter
const filteredEvents = computed(() => {
  if (activeFilter.value === 'All') return events.value
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
    console.error('Failed to fetch events:', err)
    error.value = 'Failed to load events. Please try again.'
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
        await eventService.postEventToTelegram(selectedEvent.value.eventId)
      } catch (telegramErr) {
        console.error('Failed to post to Telegram:', telegramErr)
        // Don't block the flow - event is already published
      }
    }

    // Refresh the events list
    await fetchEvents()
    closePublishModal()
  } catch (err) {
    console.error('Failed to publish event:', err)
    error.value = 'Failed to publish event. Please try again.'
  } finally {
    publishing.value = false
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
const getStatusClass = (status) => {
  if (status === 'Published') {
    return 'bg-foreground text-background'
  } else if (status === 'Draft') {
    return 'bg-muted text-muted-foreground'
  } else if (status === 'Cancelled') {
    return 'bg-destructive/10 text-destructive'
  }
  return 'bg-muted text-muted-foreground'
}

// Fetch events on mount
onMounted(() => {
  fetchEvents()
})
</script>
