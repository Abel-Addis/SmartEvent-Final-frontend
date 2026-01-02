<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="card">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="section-title">Organizer Dashboard</span>
          <h2 class="text-h2 mt-1">
            Welcome back, {{ organizerName }}!
          </h2>
          <p class="text-muted-foreground mt-1">
            Manage your events and track performance
          </p>
        </div>
        <router-link to="/organizer/create-event" class="btn-primary px-5 py-2.5 whitespace-nowrap">
          + Create Event
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <stat-card :label="'Active Events'" :value="stats.activeEvents.toString()" icon="🎪" :trend="'0'" />
      <stat-card :label="'Total Events'" :value="stats.totalEvents.toString()" icon="📅" :trend="'0'" />
      <stat-card :label="'Draft Events'" :value="stats.draftEvents.toString()" icon="📝" :trend="'0'" />
      <stat-card :label="'Published'" :value="stats.publishedEvents.toString()" icon="✅" :trend="'0'" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <p class="text-muted-foreground">Loading your events...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="card bg-destructive/10 border-destructive/20 text-destructive p-4">
      {{ error }}
    </div>

    <!-- Events Overview -->
    <div v-if="!loading">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-h3">
          Your Events
        </h3>
        <router-link to="/organizer/events" class="text-sm font-medium hover:underline">
          View All
        </router-link>
      </div>

      <!-- No Events State -->
      <div v-if="events.length === 0" class="card text-center py-12">
        <div class="text-4xl mb-4">📅</div>
        <h4 class="font-semibold mb-2">No Events Yet</h4>
        <p class="text-sm text-muted-foreground mb-4">Create your first event to get started</p>
        <router-link to="/organizer/create-event" class="btn-primary px-5 py-2.5">
          Create Event
        </router-link>
      </div>

      <!-- Events List -->
      <div v-else class="space-y-3">
        <div v-for="event in events" :key="event.eventId" class="card hover:shadow-md transition-shadow">
          <div class="flex flex-col gap-4">
            <!-- Event Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-semibold text-foreground">
                    {{ event.title }}
                  </h4>
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusClass(event.status)]">
                    {{ event.status }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ event.categoryName }} • {{ formatDate(event.startDate) }}
                </p>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ event.venue }} • Capacity: {{ event.totalCapacity }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 flex-wrap">
                <button v-if="event.status === 'Draft'" class="btn-primary px-3 py-1.5 text-xs"
                  @click="publishEvent(event.eventId)">
                  Publish
                </button>
                <router-link :to="`/organizer/events/${event.eventId}/edit`" class="btn-outline px-3 py-1.5 text-xs">
                  Edit
                </router-link>
                <router-link :to="`/organizer/events/${event.eventId}`" class="btn-outline px-3 py-1.5 text-xs">
                  View Details
                </router-link>
                <router-link to="/organizer/analytics" class="btn-outline px-3 py-1.5 text-xs">
                  Analytics
                </router-link>
              </div>
            </div>

            <!-- Event Image -->
            <div v-if="event.bannerImageUrl" class="rounded-lg overflow-hidden">
              <img :src="event.bannerImageUrl" :alt="event.title" class="w-full h-48 object-cover">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <router-link to="/organizer/create-event"
        class="card hover:shadow-md transition-shadow text-center p-6 cursor-pointer hover:border-foreground/20">
        <div class="text-3xl mb-3">➕</div>
        <h4 class="font-semibold text-foreground mb-1">Create Event</h4>
        <p class="text-xs text-muted-foreground">Start a new event</p>
      </router-link>
      <router-link to="/organizer/analytics"
        class="card hover:shadow-md transition-shadow text-center p-6 cursor-pointer hover:border-foreground/20">
        <div class="text-3xl mb-3">📊</div>
        <h4 class="font-semibold text-foreground mb-1">View Analytics</h4>
        <p class="text-xs text-muted-foreground">Track performance</p>
      </router-link>
      <router-link to="/organizer/finance"
        class="card hover:shadow-md transition-shadow text-center p-6 cursor-pointer hover:border-foreground/20">
        <div class="text-3xl mb-3">💰</div>
        <h4 class="font-semibold text-foreground mb-1">Manage Finance</h4>
        <p class="text-xs text-muted-foreground">View revenue</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import { organizerService } from '@/services/organizerService'
import { eventService } from '@/services/eventService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const events = ref([])
const loading = ref(false)
const error = ref(null)

// Get organizer name from auth store
const organizerName = computed(() => {
  return authStore.user?.fullName || 'Organizer'
})

// Calculate stats
const stats = computed(() => {
  const activeEvents = events.value.filter(e => e.status === 'Published').length
  const draftEvents = events.value.filter(e => e.status === 'Draft').length
  const publishedEvents = events.value.filter(e => e.status === 'Published').length

  return {
    activeEvents,
    totalEvents: events.value.length,
    draftEvents,
    publishedEvents
  }
})

// Fetch dashboard events
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

// Publish event
const publishEvent = async (eventId) => {
  console.log(eventId);

  try {
    await eventService.publishEvent(eventId)
    // Refresh events
    await fetchEvents()
  } catch (err) {
    console.error('Failed to publish event:', err)
    error.value = 'Failed to publish event. Please try again.'
  }
}

// Format date
const formatDate = (dateString) => {
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
    return 'bg-secondary text-foreground border border-border'
  }
  return 'bg-muted text-muted-foreground'
}

// Fetch events on mount
onMounted(() => {
  fetchEvents()
})
</script>
