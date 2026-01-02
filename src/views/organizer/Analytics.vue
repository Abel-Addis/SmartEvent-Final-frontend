<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-h2 font-bold mb-2">
        Analytics Overview
      </h1>
      <p class="text-muted-foreground">
        Track your events performance and revenue
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <p class="text-muted-foreground">Loading analytics...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="card bg-destructive/10 border-destructive/20 text-destructive p-4">
      {{ error }}
    </div>

    <!-- Analytics Content -->
    <div v-if="!loading && overview" class="space-y-8">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <stat-card label="Total Events" :value="overview.totalEvents.toString()" icon="📅" :trend="'0'" />
        <stat-card label="Total Revenue" :value="`$${formatNumber(overview.totalRevenue)}`" icon="💰" :trend="'0'" />
        <stat-card label="Tickets Sold" :value="overview.totalTicketsSold.toString()" icon="🎫" :trend="'0'" />
        <stat-card label="Total Bookings" :value="overview.totalBookings.toString()" icon="👥" :trend="'0'" />
      </div>

      <!-- Event Status Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card">
          <p class="text-sm text-muted-foreground mb-1">Published Events</p>
          <p class="text-2xl font-bold">{{ overview.publishedEvents }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-muted-foreground mb-1">Draft Events</p>
          <p class="text-2xl font-bold">{{ overview.draftEvents }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-muted-foreground mb-1">Confirmed Bookings</p>
          <p class="text-2xl font-bold">{{ overview.confirmedBookings }}</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Daily Sales Trend -->
        <div v-if="dailySalesChartData" class="card">
          <h3 class="text-h3 font-bold mb-4">Daily Sales Trend</h3>
          <div class="h-80">
            <LineChart :chart-data="dailySalesChartData" />
          </div>
        </div>

        <!-- Revenue by Event -->
        <div v-if="revenueBreakdownChartData" class="card">
          <h3 class="text-h3 font-bold mb-4">Revenue by Event</h3>
          <div class="h-80">
            <BarChart :chart-data="revenueBreakdownChartData" />
          </div>
        </div>

        <!-- Booking Status Distribution -->
        <div v-if="bookingStatusChartData" class="card">
          <h3 class="text-h3 font-bold mb-4">Booking Status</h3>
          <div class="h-80 flex items-center justify-center">
            <DoughnutChart :chart-data="bookingStatusChartData" />
          </div>
        </div>

        <!-- Event Status Distribution -->
        <div v-if="eventStatusChartData" class="card">
          <h3 class="text-h3 font-bold mb-4">Event Status Distribution</h3>
          <div class="h-80 flex items-center justify-center">
            <DoughnutChart :chart-data="eventStatusChartData" />
          </div>
        </div>
      </div>

      <!-- Top Events -->
      <div v-if="overview.topEvents && overview.topEvents.length > 0" class="card">
        <h3 class="text-h3 font-bold mb-4">
          Top Performing Events
        </h3>
        <div class="space-y-3">
          <div v-for="event in overview.topEvents" :key="event.eventId"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div v-if="event.coverImage" class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img :src="event.coverImage" :alt="event.eventName" class="w-full h-full object-cover">
            </div>
            <div v-else class="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <span class="text-2xl">🎪</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate">{{ event.eventName }}</p>
              <p class="text-sm text-muted-foreground">{{ event.ticketsSold }} tickets sold</p>
            </div>
            <div class="text-right">
              <p class="font-bold">${{ formatNumber(event.revenue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Events Analytics List -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-h3 font-bold">
            Events Performance
          </h3>
          <button class="btn-outline px-3 py-2 text-sm" @click="refreshData">
            Refresh
          </button>
        </div>

        <!-- Events Table -->
        <div v-if="eventsAnalytics.length === 0" class="text-center py-8 text-muted-foreground">
          No events data available
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted border-b border-border">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold">Event</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Tickets Sold</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Revenue</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in eventsAnalytics" :key="event.eventId"
                class="border-b border-border hover:bg-muted/50 transition-colors">
                <td class="px-4 py-3">
                  <p class="font-medium">{{ event.title }}</p>
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ formatDate(event.startDate) }}
                </td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(event.status)]">
                    {{ event.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-medium">{{ event.ticketsSold }}</span>
                  <span class="text-sm text-muted-foreground">/ {{ event.totalTickets }}</span>
                </td>
                <td class="px-4 py-3 font-semibold">
                  ${{ formatNumber(event.totalRevenue) }}
                </td>
                <td class="px-4 py-3">
                  <button class="btn-outline px-3 py-1 text-xs" @click="viewEventDetails(event.eventId)">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="selectedEvent"
      class="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="card max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-h2 font-bold">{{ selectedEvent.title }}</h2>
            <p class="text-sm text-muted-foreground mt-1">
              {{ formatDate(selectedEvent.startDate) }} - {{ formatDate(selectedEvent.endDate) }}
            </p>
          </div>
          <button class="text-2xl hover:opacity-70 transition-opacity" @click="selectedEvent = null">
            ✕
          </button>
        </div>

        <!-- Event Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 rounded-lg bg-muted">
            <p class="text-2xl font-bold">{{ selectedEvent.totalTicketsSold }}</p>
            <p class="text-sm text-muted-foreground">Tickets Sold</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-muted">
            <p class="text-2xl font-bold">${{ formatNumber(selectedEvent.totalRevenue) }}</p>
            <p class="text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-muted">
            <p class="text-2xl font-bold">{{ selectedEvent.remainingTickets }}</p>
            <p class="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>

        <!-- Booking Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="p-3 rounded-lg border border-border">
            <p class="text-sm text-muted-foreground">Confirmed</p>
            <p class="text-lg font-semibold">{{ selectedEvent.confirmedBookings }}</p>
          </div>
          <div class="p-3 rounded-lg border border-border">
            <p class="text-sm text-muted-foreground">Pending</p>
            <p class="text-lg font-semibold">{{ selectedEvent.pendingBookings }}</p>
          </div>
          <div class="p-3 rounded-lg border border-border">
            <p class="text-sm text-muted-foreground">Cancelled</p>
            <p class="text-lg font-semibold">{{ selectedEvent.cancelledBookings }}</p>
          </div>
        </div>

        <!-- Last 7 Days Sales Chart -->
        <div v-if="eventSalesChartData" class="card bg-muted/30">
          <h3 class="text-h4 font-semibold mb-3">Last 7 Days Sales</h3>
          <div class="h-64">
            <LineChart :chart-data="eventSalesChartData" />
          </div>
        </div>

        <!-- Ticket Distribution -->
        <div v-if="ticketDistributionChartData" class="card bg-muted/30">
          <h3 class="text-h4 font-semibold mb-3">Ticket Sales Distribution</h3>
          <div class="h-64 flex items-center justify-center">
            <DoughnutChart :chart-data="ticketDistributionChartData" />
          </div>
        </div>

        <!-- Ticket Breakdown -->
        <div>
          <h3 class="text-h3 font-semibold mb-3">Ticket Types Performance</h3>
          <div class="space-y-2">
            <div v-for="ticket in selectedEvent.tickets" :key="ticket.ticketTypeId"
              class="p-3 rounded-lg border border-border">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-medium">{{ ticket.ticketName }}</p>
                  <p v-if="ticket.appliedPricingRuleName" class="text-xs text-muted-foreground">
                    Rule: {{ ticket.appliedPricingRuleName }}
                  </p>
                </div>
                <p class="font-bold">${{ ticket.currentPrice }}</p>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Sold: {{ ticket.sold }} / {{ ticket.totalAvailable }}</span>
                <span class="font-semibold">Revenue: ${{ formatNumber(ticket.revenue) }}</span>
              </div>
              <div class="mt-2 bg-muted rounded-full h-2">
                <div class="bg-foreground h-2 rounded-full transition-all"
                  :style="{ width: `${(ticket.sold / ticket.totalAvailable) * 100}%` }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Booked Users Section -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-h3 font-semibold">Booked Users</h3>
            <div class="flex gap-2">
              <button class="btn-outline px-3 py-2 text-sm" @click="loadBookedUsers(selectedEvent.eventId)">
                {{ bookedUsers.length > 0 ? 'Refresh' : 'Load Users' }}
              </button>
              <button v-if="bookedUsers.length > 0" class="btn-primary px-3 py-2 text-sm"
                @click="exportUsers(selectedEvent.eventId)">
                Export CSV
              </button>
            </div>
          </div>

          <div v-if="loadingUsers" class="text-center py-8 text-muted-foreground">
            Loading users...
          </div>

          <div v-else-if="bookedUsers.length === 0" class="text-center py-8 text-muted-foreground">
            No booked users yet. Click "Load Users" to fetch data.
          </div>

          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <div v-for="user in bookedUsers" :key="user.userId" class="p-3 rounded-lg border border-border">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-medium">{{ user.fullName }}</p>
                  <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                  <p class="text-sm text-muted-foreground">{{ user.phoneNumber }}</p>
                </div>
                <p class="font-bold">${{ formatNumber(user.totalSpent) }}</p>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ user.tickets.length }} ticket(s)
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn-outline px-4 py-2" @click="selectedEvent = null">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import { organizerService } from '@/services/organizerService'

const loading = ref(false)
const error = ref(null)
const overview = ref(null)
const eventsAnalytics = ref([])
const selectedEvent = ref(null)
const bookedUsers = ref([])
const loadingUsers = ref(false)

// Helper to detect if dark mode is active
const isDarkMode = () => {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark') || 
         window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Get visible chart colors that work in both light and dark modes
const getChartColors = () => {
  const dark = isDarkMode()
  
  // Return distinct, visible colors
  // Light mode: darker, more saturated colors
  // Dark mode: lighter, more vibrant colors
  return {
    primary: dark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',      // Blue
    primaryLight: dark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.2)',
    secondary: dark ? 'rgba(167, 243, 208, 1)' : 'rgba(16, 185, 129, 1)', // Green
    secondaryLight: dark ? 'rgba(167, 243, 208, 0.2)' : 'rgba(16, 185, 129, 0.2)',
    accent: dark ? 'rgba(251, 191, 36, 1)' : 'rgba(245, 158, 11, 1)',     // Orange/Yellow
    accentLight: dark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.2)',
    purple: dark ? 'rgba(196, 181, 253, 1)' : 'rgba(139, 92, 246, 1)',   // Purple
    purpleLight: dark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(139, 92, 246, 0.2)',
    pink: dark ? 'rgba(251, 113, 133, 1)' : 'rgba(236, 72, 153, 1)',     // Pink
    pinkLight: dark ? 'rgba(251, 113, 133, 0.2)' : 'rgba(236, 72, 153, 0.2)',
    teal: dark ? 'rgba(94, 234, 212, 1)' : 'rgba(20, 184, 166, 1)',      // Teal
    tealLight: dark ? 'rgba(94, 234, 212, 0.2)' : 'rgba(20, 184, 166, 0.2)',
    red: dark ? 'rgba(252, 165, 165, 1)' : 'rgba(239, 68, 68, 1)',       // Red
    redLight: dark ? 'rgba(252, 165, 165, 0.2)' : 'rgba(239, 68, 68, 0.2)',
    gray: dark ? 'rgba(203, 213, 225, 1)' : 'rgba(100, 116, 139, 1)',    // Gray
    grayLight: dark ? 'rgba(203, 213, 225, 0.2)' : 'rgba(100, 116, 139, 0.2)'
  }
}

// Chart data computed properties
const dailySalesChartData = computed(() => {
  if (!overview.value || !overview.value.dailySales || overview.value.dailySales.length === 0) {
    return null
  }

  const colors = getChartColors()
  const sortedSales = [...overview.value.dailySales].sort((a, b) => new Date(a.date) - new Date(b.date))

  return {
    labels: sortedSales.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Tickets Sold',
        data: sortedSales.map(item => item.ticketsSold),
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Revenue ($)',
        data: sortedSales.map(item => item.revenue),
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }
})

const revenueBreakdownChartData = computed(() => {
  if (!overview.value || !overview.value.eventRevenueBreakdown || overview.value.eventRevenueBreakdown.length === 0) {
    return null
  }

  const colors = getChartColors()
  const sortedEvents = [...overview.value.eventRevenueBreakdown]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10) // Top 10 events

  // Create gradient colors for bars
  const barColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.purple,
    colors.pink,
    colors.teal,
    colors.red,
    colors.gray,
    colors.primary,
    colors.secondary
  ]

  return {
    labels: sortedEvents.map(item => {
      // Truncate long event names
      return item.eventName.length > 20 ? item.eventName.substring(0, 20) + '...' : item.eventName
    }),
    datasets: [
      {
        label: 'Revenue ($)',
        data: sortedEvents.map(item => item.revenue),
        backgroundColor: barColors.slice(0, sortedEvents.length),
        borderColor: isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    ]
  }
})

const bookingStatusChartData = computed(() => {
  if (!overview.value) return null

  const colors = getChartColors()
  const dark = isDarkMode()

  return {
    labels: ['Confirmed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          overview.value.confirmedBookings,
          overview.value.totalBookings - overview.value.confirmedBookings - overview.value.cancelledBookings,
          overview.value.cancelledBookings
        ],
        backgroundColor: [
          colors.secondary,  // Green for confirmed
          colors.accent,     // Orange/Yellow for pending
          colors.red         // Red for cancelled
        ],
        borderColor: dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2
      }
    ]
  }
})

const eventStatusChartData = computed(() => {
  if (!overview.value) return null

  const colors = getChartColors()
  const dark = isDarkMode()

  return {
    labels: ['Published', 'Draft'],
    datasets: [
      {
        data: [overview.value.publishedEvents, overview.value.draftEvents],
        backgroundColor: [
          colors.primary,  // Blue for published
          colors.gray     // Gray for draft
        ],
        borderColor: dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2
      }
    ]
  }
})

const eventSalesChartData = computed(() => {
  if (!selectedEvent.value || !selectedEvent.value.last7DaysSales || selectedEvent.value.last7DaysSales.length === 0) {
    return null
  }

  const colors = getChartColors()
  const sortedSales = [...selectedEvent.value.last7DaysSales].sort((a, b) => new Date(a.date) - new Date(b.date))

  return {
    labels: sortedSales.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Tickets Sold',
        data: sortedSales.map(item => item.ticketsSold),
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const ticketDistributionChartData = computed(() => {
  if (!selectedEvent.value || !selectedEvent.value.tickets || selectedEvent.value.tickets.length === 0) {
    return null
  }

  const colors = getChartColors()
  const dark = isDarkMode()
  const chartColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.purple,
    colors.pink,
    colors.teal,
    colors.red,
    colors.gray
  ]

  return {
    labels: selectedEvent.value.tickets.map(t => t.ticketName),
    datasets: [
      {
        data: selectedEvent.value.tickets.map(t => t.sold),
        backgroundColor: chartColors.slice(0, selectedEvent.value.tickets.length),
        borderColor: dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2
      }
    ]
  }
})

// Fetch overview analytics
const fetchOverview = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await organizerService.getAnalyticsOverview()
    overview.value = data
  } catch (err) {
    console.error('Failed to fetch overview:', err)
    error.value = 'Failed to load analytics overview'
  } finally {
    loading.value = false
  }
}

// Fetch events analytics
const fetchEventsAnalytics = async () => {
  try {
    const data = await organizerService.getAnalyticsEvents()
    eventsAnalytics.value = data
  } catch (err) {
    console.error('Failed to fetch events analytics:', err)
  }
}

// View event details
const viewEventDetails = async (eventId) => {
  try {
    const data = await organizerService.getEventAnalytics(eventId)
    selectedEvent.value = data
    bookedUsers.value = [] // Reset booked users
  } catch (err) {
    console.error('Failed to fetch event details:', err)
    error.value = 'Failed to load event details'
  }
}

// Load booked users
const loadBookedUsers = async (eventId) => {
  loadingUsers.value = true

  try {
    const data = await organizerService.getBookedUsers(eventId)
    bookedUsers.value = data
  } catch (err) {
    console.error('Failed to fetch booked users:', err)
    error.value = 'Failed to load booked users'
  } finally {
    loadingUsers.value = false
  }
}

// Export users
const exportUsers = async (eventId) => {
  try {
    const blob = await organizerService.exportBookedUsers(eventId, { format: 'csv' })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `booked-users-${eventId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export users:', err)
    error.value = 'Failed to export users'
  }
}

// Refresh all data
const refreshData = async () => {
  await fetchOverview()
  await fetchEventsAnalytics()
}

// Format number
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
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
  }
  return 'bg-muted text-muted-foreground'
}

// Fetch data on mount
onMounted(async () => {
  await fetchOverview()
  await fetchEventsAnalytics()
})
</script>
