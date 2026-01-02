<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-h2 font-bold">
          Event Management
        </h2>
        <p class="text-muted-foreground">
          Monitor and moderate all platform events ({{ filteredEvents.length }} events)
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 sm:p-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Search Events</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Event name, venue..."
            class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">
              All Status
            </option>
            <option value="Published">
              Published
            </option>
            <option value="Draft">
              Draft
            </option>
            <option value="Cancelled">
              Cancelled
            </option>
            <option value="Completed">
              Completed
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            class="w-full btn-primary"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && events.length === 0" class="flex justify-center py-12">
      <p class="text-muted-foreground">Loading events...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="p-4 rounded-lg bg-destructive/10 text-destructive text-center">
      {{ error }}
    </div>

    <!-- Events List -->
    <div v-else class="space-y-4">
      <div
        v-for="event in filteredEvents"
        :key="event.eventId"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1">
            <h4 class="text-h4 font-bold mb-1">
              {{ event.title }}
            </h4>
            <p class="text-muted-foreground text-sm mb-2">
              <span v-if="event.categoryName">{{ event.categoryName }} • </span>
              {{ formatDate(event.startDate) }}
              <span v-if="event.venue">• {{ event.venue }}</span>
            </p>
            <div class="flex items-center gap-3">
              <span :class="getStatusClass(event.status)">
                {{ event.status }}
              </span>
              <span class="text-sm text-muted-foreground">Capacity: {{ event.totalCapacity }}</span>
            </div>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              class="btn-outline px-3 py-1 text-sm flex-1 sm:flex-none"
              @click="viewEvent(event.eventId)"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredEvents.length === 0 && !loading" class="text-center py-12 text-muted-foreground">
        No events found matching your criteria.
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="showModal && selectedEvent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-card w-full max-w-3xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border">
        <!-- Modal Header -->
        <div class="sticky top-0 z-10 bg-card border-b border-border p-6 flex justify-between items-start">
          <div>
            <h3 class="text-2xl font-bold">{{ selectedEvent.title }}</h3>
            <p class="text-muted-foreground">{{ selectedEvent.categoryName }}</p>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-muted rounded-full">
            ✕
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-8">
          <!-- Status Banner -->
          <div class="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusClass(selectedEvent.status)]">
              {{ selectedEvent.status }}
            </span>
            <div class="h-4 w-px bg-border"></div>
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Capacity</p>
              <p class="font-medium">{{ selectedEvent.totalCapacity }} attendees</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedEvent.description">
            <h4 class="text-lg font-semibold mb-2">About Event</h4>
            <p class="text-muted-foreground whitespace-pre-line">{{ selectedEvent.description }}</p>
          </div>

          <!-- Date & Location Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h4 class="text-lg font-semibold flex items-center gap-2">
                📅 Date & Time
              </h4>
              <div class="bg-muted/30 p-4 rounded-lg space-y-3">
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Starts</p>
                  <p class="font-medium">{{ formatDateTime(selectedEvent.startDate) }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Ends</p>
                  <p class="font-medium">{{ formatDateTime(selectedEvent.endDate) }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="text-lg font-semibold flex items-center gap-2">
                📍 Location
              </h4>
              <div class="bg-muted/30 p-4 rounded-lg space-y-3">
                <div v-if="selectedEvent.venue">
                  <p class="text-xs text-muted-foreground uppercase">Venue</p>
                  <p class="font-medium">{{ selectedEvent.venue }}</p>
                </div>
                <div v-if="selectedEvent.location">
                  <p class="text-xs text-muted-foreground uppercase">Address</p>
                  <p class="font-medium">{{ selectedEvent.location }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Ticket Types -->
          <div v-if="selectedEvent.ticketTypes && selectedEvent.ticketTypes.length > 0">
            <h4 class="text-lg font-semibold mb-4">Ticket Types</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                v-for="ticket in selectedEvent.ticketTypes" 
                :key="ticket.id"
                class="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div class="flex justify-between items-start mb-2">
                  <h5 class="font-semibold">{{ ticket.name }}</h5>
                  <span class="font-bold text-primary">${{ ticket.currentPrice }}</span>
                </div>
                <p class="text-sm text-muted-foreground mb-3 line-clamp-2">{{ ticket.description }}</p>
                
                <div class="flex justify-between items-center text-sm border-t border-border pt-3 mt-auto">
                  <span class="text-muted-foreground">Sold: {{ ticket.sold }} / {{ ticket.quantity }}</span>
                  <div class="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-primary" 
                      :style="{ width: `${(ticket.sold / ticket.quantity) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end gap-3">
          <button @click="closeModal" class="btn-outline px-6">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()

const searchQuery = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const selectedEvent = ref(null)

// Computed properties from store
const events = computed(() => adminStore.events)
const loading = computed(() => adminStore.loading)
const error = computed(() => adminStore.error)

// Frontend filtering
const filteredEvents = computed(() => {
  return events.value.filter(event => {
    // Search logic: check title, venue, category
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = !searchQuery.value || 
      (event.title && event.title.toLowerCase().includes(query)) ||
      (event.venue && event.venue.toLowerCase().includes(query)) ||
      (event.location && event.location.toLowerCase().includes(query)) ||
      (event.categoryName && event.categoryName.toLowerCase().includes(query))
      
    // Status filter logic
    const matchesStatus = !filterStatus.value || event.status === filterStatus.value
    
    return matchesSearch && matchesStatus
  })
})

onMounted(async () => {
  await adminStore.fetchAllEvents()
})

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
}

const getStatusClass = (status) => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium'
  switch (status) {
    case 'Published':
      return `bg-primary/10 text-primary`
    case 'Draft':
      return `bg-muted text-muted-foreground`
    case 'Cancelled':
      return `bg-destructive/10 text-destructive`
    case 'Completed':
      return `bg-accent/10 text-accent-foreground`
    default:
      return `bg-muted text-foreground`
  }
}

const formatDate = (dateString, options = {}) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const viewEvent = (id) => {
  const event = events.value.find(e => e.eventId === id)
  if (event) {
    selectedEvent.value = event
    showModal.value = true
  }
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    selectedEvent.value = null
  }, 300)
}
</script>
