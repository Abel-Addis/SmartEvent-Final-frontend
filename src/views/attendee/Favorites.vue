<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-h2 font-bold mb-2">
        My Favorite Events
      </h1>
      <p class="text-muted-foreground">
        {{ favoriteEvents.length }} events saved
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p class="text-muted-foreground">Loading your favorites...</p>
    </div>

    <!-- Favorites Grid -->
    <div
      v-else-if="favoriteEvents.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="event in favoriteEvents"
        :key="event.eventId"
        class="card group cursor-pointer hover:shadow-lg transition-all duration-200 relative"
        @click="navigateToEvent(event.eventId)"
      >
        <button
          class="absolute top-3 right-3 z-10 p-2 bg-destructive/90 hover:bg-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          @click.stop="handleRemoveFavorite(event.eventId)"
          title="Remove from favorites"
        >
          <span class="text-lg">❤️</span>
        </button>
        
        <!-- Event Image -->
        <div 
          class="relative h-40 rounded-2xl flex items-center justify-center overflow-hidden border border-border mb-4"
          :style="event.bannerImageUrl ? `background-image: url(${event.bannerImageUrl}); background-size: cover; background-position: center;` : ''"
        >
          <div v-if="!event.bannerImageUrl" class="bg-gradient-to-br from-primary/20 to-accent/20 w-full h-full flex items-center justify-center">
            <span class="text-5xl">🎉</span>
          </div>
          <div v-else class="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          
          <!-- Category Badge -->
          <div class="absolute top-2 left-2 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-md text-xs font-medium border border-border">
            {{ event.categoryName || 'Event' }}
          </div>
        </div>
        
        <h4 class="text-h4 font-semibold mb-1 line-clamp-1">
          {{ event.title }}
        </h4>
        <p class="text-muted-foreground text-sm mb-3 line-clamp-2">
          {{ event.description || 'No description available' }}
        </p>
        
        <div class="flex items-center justify-between text-sm pt-3 border-t border-border">
          <span class="text-muted-foreground flex items-center gap-1">
            <span>📅</span>
            {{ formatDate(event.startDate) }}
          </span>
          <span class="text-primary font-semibold">
            {{ event.lowestTicketPrice > 0 ? formatCurrency(event.lowestTicketPrice) : 'Free' }}
          </span>
        </div>
        
        <div class="mt-3 text-xs text-muted-foreground flex items-center gap-1">
          <span>📍</span>
          {{ event.venue || 'Venue TBA' }}
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="card text-center py-12"
    >
      <p class="text-4xl mb-4">
        🤍
      </p>
      <h3 class="text-h3 font-bold mb-2">
        No Favorites Yet
      </h3>
      <p class="text-muted-foreground mb-6">
        Save events to quickly access them later
      </p>
      <router-link
        to="/dashboard/events"
        class="btn-primary inline-block px-6 py-2"
      >
        Browse Events
      </router-link>
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
import { useFavoritesStore } from '@/stores/favorites'
import { attendeeService } from '@/services/attendeeService'
import ErrorNotification from '@/components/ErrorNotification.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()

const router = useRouter()
const favoritesStore = useFavoritesStore()

const allEvents = ref([])
const loading = ref(false)

// Computed property to filter events by favorite IDs
const favoriteEvents = computed(() => {
  const favoriteIds = favoritesStore.getFavoriteIds
  return allEvents.value.filter(event => 
    favoriteIds.includes(String(event.eventId))
  )
})

onMounted(async () => {
  await fetchEvents()
})

const fetchEvents = async () => {
  loading.value = true
  try {
    // Fetch all active events
    const result = await attendeeService.searchEvents({
      PageNumber: 1,
      PageSize: 100 // Get a large set to ensure we have all favorited events
    })
    allEvents.value = result.items || []
  } catch (err) {
    displayError(err, 'Failed to fetch events')
    allEvents.value = []
  } finally {
    loading.value = false
  }
}

const handleRemoveFavorite = (eventId) => {
  favoritesStore.removeFavorite(eventId)
}

const navigateToEvent = (eventId) => {
  router.push(`/dashboard/events/${eventId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Date TBA'
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-ET', { 
    style: 'currency', 
    currency: 'ETB' 
  }).format(val)
}
</script>

