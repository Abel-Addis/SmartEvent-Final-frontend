<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <button @click="router.back()" class="text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <span class="text-muted-foreground">/</span>
          <span class="text-sm text-muted-foreground">Analytics</span>
        </div>
        <h1 class="text-h2 font-bold flex items-center gap-3">
          {{ event?.title || 'Loading...' }}
          <span v-if="event" :class="['px-2 py-1 rounded text-xs font-medium border', getStatusClass(event.status)]">
            {{ event.status }}
          </span>
        </h1>
        <p v-if="event" class="text-muted-foreground mt-1">
          {{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}
        </p>
      </div>
      <div class="flex gap-2">
         <button @click="loadData" class="btn-outline px-3 py-2 text-sm">
            Refresh Data
         </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <p class="text-muted-foreground">Loading event analytics...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="card bg-destructive/10 border-destructive/20 text-destructive p-4">
      {{ typeof error === 'string' ? error : (error.response?.data?.error || error.message || 'An error occurred') }}
      <div class="mt-2 text-xs">
        <button @click="loadData" class="text-sm underline hover:no-underline">Try Again</button>
      </div>
    </div>

    <div v-if="!loading && event" class="space-y-6">
      
      <!-- Key Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
            <p class="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p class="text-2xl font-bold text-primary">${{ formatNumber(event.totalRevenue) }}</p>
        </div>
        <div class="card p-4">
            <p class="text-sm text-muted-foreground mb-1">Tickets Sold</p>
            <p class="text-2xl font-bold">{{ event.totalTicketsSold }} <span class="text-sm font-normal text-muted-foreground">/ {{ event.totalTicketsSold + event.remainingTickets }}</span></p>
        </div>
         <div class="card p-4">
            <p class="text-sm text-muted-foreground mb-1">Confirmed Attendees</p>
            <p class="text-2xl font-bold text-green-600">{{ event.confirmedBookings }}</p>
        </div>
         <div class="card p-4">
            <p class="text-sm text-muted-foreground mb-1">Pending Bookings</p>
            <p class="text-2xl font-bold text-amber-500">{{ event.pendingBookings }}</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Trend -->
        <div class="card">
          <h3 class="text-h3 font-bold mb-4">Sales Trend (Last 7 Days)</h3>
          <div v-if="salesChartData" class="h-80">
             <LineChart :chart-data="salesChartData" :options="commonOptions" :key="isDark" />
          </div>
          <div v-else class="h-80 flex items-center justify-center text-muted-foreground">
             No sales data available for this period.
          </div>
        </div>

        <!-- Ticket Distribution -->
        <div class="card">
          <h3 class="text-h3 font-bold mb-4">Ticket Sales Distribution</h3>
          <div v-if="distributionChartData" class="h-80 flex items-center justify-center">
             <DoughnutChart :chart-data="distributionChartData" :options="commonOptions" :key="isDark" />
          </div>
           <div v-else class="h-80 flex items-center justify-center text-muted-foreground">
             No ticket sales data available.
          </div>
        </div>
      </div>

      <!-- Ticket Types Performance -->
      <div class="card">
         <h3 class="text-h3 font-bold mb-4">Ticket Performance</h3>
         <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-muted/50 border-b border-border">
                    <tr>
                        <th class="text-left px-4 py-3 text-sm font-semibold">Ticket Type</th>
                        <th class="text-right px-4 py-3 text-sm font-semibold">Price</th>
                        <th class="text-right px-4 py-3 text-sm font-semibold">Sold</th>
                        <th class="text-right px-4 py-3 text-sm font-semibold">Revenue</th>
                        <th class="text-left px-4 py-3 text-sm font-semibold">Progress</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ticket in event.tickets" :key="ticket.ticketTypeId" class="border-b border-border hover:bg-muted/30">
                        <td class="px-4 py-3">
                            <div class="font-medium">{{ ticket.ticketName }}</div>
                            <div v-if="ticket.appliedPricingRuleName" class="text-xs text-muted-foreground">
                                Rule: {{ ticket.appliedPricingRuleName }}
                            </div>
                        </td>
                        <td class="px-4 py-3 text-right">
                             ${{ formatNumber(ticket.currentPrice) }}
                        </td>
                         <td class="px-4 py-3 text-right">
                             {{ ticket.sold }} / {{ ticket.totalAvailable }}
                        </td>
                         <td class="px-4 py-3 text-right font-medium">
                             ${{ formatNumber(ticket.revenue) }}
                        </td>
                        <td class="px-4 py-3 w-48">
                             <div class="h-2 bg-muted rounded-full overflow-hidden">
                                <div class="h-full bg-primary" :style="{ width: `${(ticket.sold / ticket.totalAvailable) * 100}%` }"></div>
                             </div>
                             <div class="text-xs text-right mt-1 text-muted-foreground">
                                {{ Math.round((ticket.sold / ticket.totalAvailable) * 100) }}%
                             </div>
                        </td>
                    </tr>
                </tbody>
            </table>
         </div>
      </div>

      <!-- Booked Users Section -->
      <div class="card">
         <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <div>
                <h3 class="text-h3 font-bold">Booked Attendees</h3>
                <p class="text-sm text-muted-foreground">List of users who have booked tickets</p>
             </div>
             <div class="flex gap-2 w-full sm:w-auto">
                 <button @click="loadBookedUsers" :disabled="loadingUsers" class="btn-outline px-3 py-2 text-sm flex-1 sm:flex-none">
                    {{ loadingUsers ? 'Loading...' : 'Refresh List' }}
                 </button>
                 <button @click="exportBookedUsers" :disabled="bookedUsers.length === 0" class="btn-primary px-3 py-2 text-sm flex-1 sm:flex-none">
                    Download CSV
                 </button>
             </div>
         </div>

         <div v-if="loadingUsers" class="text-center py-8 text-muted-foreground">
             Loading attendees...
         </div>
         <div v-else-if="bookedUsers.length === 0" class="text-center py-12 border-2 border-dashed border-border rounded-lg">
             <div class="text-4xl mb-2">👥</div>
             <p class="text-muted-foreground">No bookings found yet.</p>
         </div>
         <div v-else class="overflow-x-auto">
             <table class="w-full">
                <thead class="bg-muted/50 border-b border-border">
                    <tr>
                         <th class="text-left px-4 py-3 text-sm font-semibold">Attendee</th>
                         <th class="text-left px-4 py-3 text-sm font-semibold">Contact</th>
                         <th class="text-right px-4 py-3 text-sm font-semibold">Tickets</th>
                         <th class="text-right px-4 py-3 text-sm font-semibold">Total Spent</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in bookedUsers" :key="user.userId" class="border-b border-border hover:bg-muted/30">
                        <td class="px-4 py-3 font-medium">
                            {{ user.fullName }}
                        </td>
                        <td class="px-4 py-3 text-sm text-muted-foreground">
                            <div>{{ user.email }}</div>
                            <div>{{ user.phoneNumber }}</div>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <div v-for="t in user.tickets" :key="t.ticketId" class="text-xs">
                                {{ t.quantity }}x {{ t.ticketTypeName }}
                            </div>
                        </td>
                        <td class="px-4 py-3 text-right font-medium">
                            ${{ formatNumber(user.totalSpent) }}
                        </td>
                    </tr>
                </tbody>
             </table>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { organizerService } from '@/services/organizerService'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import ErrorNotification from '@/components/ErrorNotification.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

const event = ref(null)
const bookedUsers = ref([])
const loading = ref(false)
const loadingUsers = ref(false)
const error = ref(null)
const isDark = ref(false)

let observer = null

// --- Theme Logic ---
const updateTheme = () => {
  if (typeof window === 'undefined') return
  isDark.value = document.documentElement.classList.contains('dark')
}

// Reuse Chart Colors from Analytics
const getChartColors = () => {
    const dark = isDark.value
    return {
        primary: dark ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',
        primaryLight: dark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.2)',
        secondary: dark ? 'rgba(52, 211, 153, 1)' : 'rgba(16, 185, 129, 1)',
        text: dark ? '#f1f5f9' : '#0f172a',
        grid: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        tooltipBg: dark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        tooltipText: dark ? '#f1f5f9' : '#0f172a',
        pieColors: [
            dark ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.8)',
            dark ? 'rgba(52, 211, 153, 0.8)' : 'rgba(16, 185, 129, 0.8)',
            dark ? 'rgba(251, 191, 36, 0.8)' : 'rgba(245, 158, 11, 0.8)',
            dark ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            dark ? 'rgba(196, 181, 253, 0.8)' : 'rgba(139, 92, 246, 0.8)',
        ]
    }
}

const commonOptions = computed(() => {
    const colors = getChartColors()
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: colors.text } },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.tooltipText,
                bodyColor: colors.tooltipText,
                borderColor: colors.grid,
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                grid: { color: colors.grid, borderColor: colors.grid },
                ticks: { color: colors.text }
            },
            y: {
                grid: { color: colors.grid, borderColor: colors.grid },
                ticks: { color: colors.text }
            }
        }
    }
})

// --- Charts Data ---
const salesChartData = computed(() => {
    if (!event.value?.last7DaysSales?.length) return null
    
    const colors = getChartColors()
    const sorted = [...event.value.last7DaysSales].sort((a,b) => new Date(a.date) - new Date(b.date))
    
    return {
        labels: sorted.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Tickets Sold',
            data: sorted.map(d => d.ticketsSold),
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
            fill: true,
            tension: 0.4
        }]
    }
})

const distributionChartData = computed(() => {
    if (!event.value?.tickets?.length) return null
    const colors = getChartColors()
    
    return {
        labels: event.value.tickets.map(t => t.ticketName),
        datasets: [{
            data: event.value.tickets.map(t => t.sold),
            backgroundColor: colors.pieColors.slice(0, event.value.tickets.length),
            borderColor: colors.grid,
            borderWidth: 1
        }]
    }
})

// --- Methods ---
const loadData = async () => {
    loading.value = true
    error.value = null
    try {
        const data = await organizerService.getEventAnalytics(eventId)
        event.value = data
        await loadBookedUsers()
    } catch (err) {
        error.value = err
        displayError(err, "Failed to load event analytics")
    } finally {
        loading.value = false
    }
}

const loadBookedUsers = async () => {
    loadingUsers.value = true
    try {
        bookedUsers.value = await organizerService.getBookedUsers(eventId)
    } catch (err) {
        displayError(err, "Failed to load attendees")
        // Don't block whole page if just users fail
    } finally {
        loadingUsers.value = false
    }
}

const exportBookedUsers = async () => {
    try {
        const blob = await organizerService.exportBookedUsers(eventId, { format: 'csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `event-${eventId}-attendees.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    } catch (err) {
        displayError(err, "Failed to export")
    }
}

const formatNumber = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(val || 0)

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    })
}

const getStatusClass = (status) => {
    if (status === 'Published') return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    return 'bg-secondary text-foreground border-border'
}

onMounted(() => {
    updateTheme()
    observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    loadData()
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})
</script>
