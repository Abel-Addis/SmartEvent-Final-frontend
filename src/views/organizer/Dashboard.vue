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
      {{ typeof error === 'string' ? error : (error.response?.data?.error || error.message || 'An error occurred') }}
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
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="event in events" :key="event.eventId" class="card p-0 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
          
          <!-- Card Header / Image Gallery -->
          <div class="relative w-full aspect-[4/3] bg-muted">
             <!-- Main Cover Image -->
             <img 
              :src="event.bannerImageUrl" 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            <!-- Additional Images Overlay (if any) -->
            <div v-if="event.media?.additionalImages?.length" class="absolute bottom-2 right-2 flex gap-1">
               <div v-for="(img, idx) in event.media.additionalImages.slice(0, 3)" :key="idx" 
                 class="w-8 h-8 rounded-md overflow-hidden border border-white/50 shadow-sm relative">
                 <img :src="img" class="w-full h-full object-cover" />
                 <div v-if="idx === 2 && event.media.additionalImages.length > 3" class="absolute inset-0 bg-black/50 text-white text-[8px] flex items-center justify-center font-bold">
                   +{{ event.media.additionalImages.length - 3 }}
                 </div>
               </div>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-3 left-3">
              <span :class="['px-2 py-1 rounded-md text-xs font-bold shadow-sm backdrop-blur-md', getStatusClass(event)]">
                {{ event.status === 'Published' && new Date(event.endDate) < new Date() ? 'Finished' : event.status }}
              </span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors" :title="event.title">
                {{ event.title }}
              </h4>
              <button class="text-muted-foreground hover:text-foreground">
                ⋮
              </button>
            </div>
            
            <p class="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
              {{ event.categoryName }} • {{ formatDate(event.startDate) }}
            </p>

            <div class="space-y-3 mt-auto">
              <div class="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                 <span>📍 {{ event.venue }}</span>
                 <span>👥 {{ event.totalCapacity }} Cap</span>
              </div>
              
              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-2">
                <router-link :to="`/organizer/events/${event.eventId}`" class="btn-outline py-2 text-xs w-full text-center">
                  View
                </router-link>
                <router-link :to="`/organizer/events/${event.eventId}/edit`" class="btn-outline py-2 text-xs w-full text-center">
                  Edit
                </router-link>
                <router-link :to="`/organizer/event-analytics/${event.eventId}`" class="btn-outline py-2 text-xs w-full text-center">
                  Analytics
                </router-link>
                 <button v-if="event.status === 'Draft'" class="btn-primary py-2 text-xs col-span-2"
                  @click="publishEvent(event.eventId)">
                  Publish Now
                </button>
              </div>
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
      <!-- <router-link to="/organizer/finance"
        class="card hover:shadow-md transition-shadow text-center p-6 cursor-pointer hover:border-foreground/20">
        <div class="text-3xl mb-3">💰</div>
        <h4 class="font-semibold text-foreground mb-1">Manage Finance</h4>
        <p class="text-xs text-muted-foreground">View revenue</p>
      </router-link> -->
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import { organizerService } from '@/services/organizerService'
import { eventService } from '@/services/eventService'
import { useAuthStore } from '@/stores/auth'
import ErrorNotification from '@/components/ErrorNotification.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()

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
  const now = new Date()
  
  // Active = Published AND Not Finished
  const activeEvents = events.value.filter(e => 
    e.status === 'Published' && new Date(e.endDate) > now
  ).length
  
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
    error.value = err
    displayError(err, 'Failed to load events')
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
    error.value = err
    displayError(err, 'Failed to publish event')
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
const getStatusClass = (event) => {
  const status = event.status
  const isFinished = status === 'Published' && new Date(event.endDate) < new Date()

  if (isFinished) {
    return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
  } else if (status === 'Published') {
    return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
  } else if (status === 'Draft') {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
  }
  return 'bg-muted text-muted-foreground'
}

// Fetch events on mount
onMounted(() => {
  fetchEvents()
})
</script>
