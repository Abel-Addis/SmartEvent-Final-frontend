<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="card relative overflow-hidden bg-gradient-to-r from-secondary/80 via-card to-card/80">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(108,111,248,0.2),transparent_35%)]" />
      <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-2">
          <span class="section-title">For you</span>
          <h2 class="text-h2 font-bold">
            Welcome back, {{ attendeeName }}!
          </h2>
          <p class="text-muted-foreground">
            Here's what's happening with your events
          </p>
        </div>
        <router-link to="/dashboard/events" class="btn-primary px-6 py-2 whitespace-nowrap">
          Browse Events
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <stat-card label="Upcoming Events" :value="upcomingCount.toString()" icon="🎪" />
      <stat-card label="My Tickets" :value="ticketsCount.toString()" icon="🎟️" />
      <stat-card label="Total Spent" :value="formatCurrency(totalSpent.toString())" icon="💰" />
      <stat-card label="Events Attended" :value="attendedCount.toString()" icon="✓" />
    </div>

    <!-- Search Section -->
    <div class="space-y-4">
      <div class="relative">
        <input v-model="searchQuery" type="text" placeholder="Search events by name, venue, or keyword..."
          class="w-full px-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          @keyup.enter="handleSearch" />
        <button @click="handleSearch" class="absolute right-2 top-2 btn-primary px-4 py-1" :disabled="searching">
          {{ searching ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-h3 font-bold">Search Results</h3>
          <button @click="clearSearch" class="text-sm text-muted-foreground hover:text-primary">Clear Search</button>
        </div>
        <div v-if="searchResults.length === 0" class="text-center py-8 text-muted-foreground">
          No events found matching your search.
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <event-card v-for="event in searchResults" :key="event.eventId" :id="event.eventId" :title="event.title"
            :image="event.bannerImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'"
            :date="formatDate(event.startDate)"
            :price="event.lowestTicketPrice > 0 ? `From ${formatCurrency(event.lowestTicketPrice)}` : 'Free'"
            :location="event.venue" :category="event.categoryName" :boostLevel="event.activeBoostLevelName" />
        </div>
      </div>
    </div>

    <!-- Main Content (Hidden if searching) -->
    <div v-if="!searchResults" class="space-y-8">

      <!-- Recommended Events Section -->
      <div v-if="recommendedEvents.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-h3 font-bold">
            Recommended For You
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <event-card v-for="event in recommendedEvents" :key="event.eventId" :id="event.eventId" :title="event.title"
            :image="event.bannerImageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'"
            :date="formatDate(event.startDate)"
            :price="event.lowestTicketPrice > 0 ? `From ${formatCurrency(event.lowestTicketPrice)}` : 'Free'"
            :location="event.venue" :category="event.categoryName" :boostLevel="event.activeBoostLevelName" />
        </div>
      </div>

      <!-- Upcoming Events Section -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-h3 font-bold">
            Upcoming Events
          </h3>
          <router-link to="/dashboard/events" class="text-primary hover:underline text-sm font-medium">
            See all
          </router-link>
        </div>
        <p v-if="loading" class="text-muted-foreground">Loading events...</p>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <event-card v-for="event in upcomingEvents" :key="event.eventId" :id="event.eventId" :title="event.title"
            :image="event.bannerImageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'"
            :date="formatDate(event.startDate)"
            :price="event.lowestTicketPrice > 0 ? `From ${formatCurrency(event.lowestTicketPrice)}` : 'Free'"
            :location="event.venue" :category="event.categoryName" :boostLevel="event.activeBoostLevelName" />
        </div>
      </div>

      <!-- Active / Trending Section -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-h3 font-bold">
            Active & Trending
          </h3>
        </div>
        <p v-if="loading" class="text-muted-foreground">Loading active events...</p>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <event-card v-for="event in activeEvents" :key="event.eventId" :id="event.eventId" :title="event.title"
            :image="event.bannerImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'"
            :date="formatDate(event.startDate)"
            :price="event.lowestTicketPrice > 0 ? `From ${formatCurrency(event.lowestTicketPrice)}` : 'Free'"
            :location="event.venue" :category="event.categoryName" :boostLevel="event.activeBoostLevelName" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import StatCard from '../../components/StatCard.vue'
import EventCard from '../../components/EventCard.vue'
import { attendeeService } from '../../services/attendeeService'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const upcomingEvents = ref([])
const activeEvents = ref([])
const recommendedEvents = ref([])
const searchResults = ref(null)
const searchQuery = ref('')
const loading = ref(true)
const searching = ref(false)


const attendeeName = computed(() => {
  return authStore.user?.fullName || 'Attendee'
})
// Stats
const myBookings = ref([])

const upcomingCount = computed(() => upcomingEvents.value?.length || 0)
const ticketsCount = computed(() => myBookings.value?.filter(b => b.paymentStatus === 'Paid').length || 0)
const totalSpent = computed(() => myBookings.value?.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0) || 0)
const attendedCount = computed(() => myBookings.value?.filter(b => b.bookingStatus === 'Attended' || (b.eventEnded && b.paymentStatus === 'Paid')).length || 0)

onMounted(async () => {
  await loadDashboard()
})

const loadDashboard = async () => {
  loading.value = true
  try {
    // Track user location for recommendations
    trackUserLocation()

    const [upcoming, active, recommended, bookings] = await Promise.all([
      attendeeService.getUpcomingEvents({ pageSize: 3 }),
      attendeeService.getActiveEvents({ pageSize: 3 }),
      attendeeService.getRecommendations().catch(() => []),
      attendeeService.getMyBookings().catch(() => [])
    ])

    upcomingEvents.value = upcoming.items || []
    activeEvents.value = active.items || []
    recommendedEvents.value = recommended || []
    myBookings.value = bookings || []
  } catch (err) {
    console.error("Failed to load dashboard", err)
  } finally {
    loading.value = false
  }
}

const trackUserLocation = () => {
  if (!navigator.geolocation) {
    console.log('Geolocation not supported')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const locationString = `${lat}|${lng}`

      try {
        await attendeeService.trackLocation(locationString)
        console.log('Location tracked successfully')
      } catch (error) {
        console.error('Failed to track location:', error)
      }
    },
    (error) => {
      console.log('Location permission denied or error:', error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    clearSearch()
    return
  }

  searching.value = true
  try {
    const result = await attendeeService.searchEvents({
      Keyword: searchQuery.value,
      PageNumber: 1,
      PageSize: 10
    })
    searchResults.value = result.items || []
  } catch (err) {
    alert("Search failed")
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = null
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(val)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
