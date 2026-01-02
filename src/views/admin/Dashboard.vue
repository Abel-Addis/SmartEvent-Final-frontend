<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="card relative overflow-hidden bg-gradient-to-r from-secondary/80 via-card to-card/80">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.1),transparent_35%)]" />
      <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-2">
          <span class="section-title">Command Center</span>
          <h2 class="text-h2 font-bold">
            Admin Control Center
          </h2>
          <p class="text-muted-foreground">
            Monitor health, growth, and trust across the platform.
          </p>
        </div>
        <div class="flex gap-2">
          <router-link to="/admin/reports" class="btn-outline px-4">View reports</router-link>
          <router-link to="/admin/settings" class="btn-primary px-4">System settings</router-link>
        </div>
      </div>
    </div>

    <!-- Platform Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <stat-card
        label="Total Users"
        :value="totalUsersCount.toLocaleString()"
        icon="👥"
        :trend="loading ? '...' : '24'"
      />
      <stat-card
        label="Active Organizers"
        :value="activeOrganizersCount.toLocaleString()"
        icon="🏢"
        :trend="loading ? '...' : '12'"
      />
      <stat-card
        label="Total Events"
        :value="totalEventsCount.toLocaleString()"
        icon="🎪"
        :trend="loading ? '...' : '38'"
      />
      <stat-card
        label="Pending Approvals"
        :value="pendingOrganizersCount.toLocaleString()"
        icon="⏳"
        :trend="loading ? '...' : '0'"
      />
    </div>

    <!-- Pending Organizers Section -->
    <div v-if="pendingOrganizersCount > 0" class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-h3 font-bold">Pending Organizer Approvals</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Review and approve new organizer registrations
          </p>
        </div>
        <span class="px-3 py-1 rounded-full bg-accent/10 text-xs font-semibold text-accent-foreground border border-accent/30">
          {{ pendingOrganizersCount }} Pending
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading && pendingOrganizers.length === 0" class="text-center py-8">
        <p class="text-muted-foreground">Loading pending organizers...</p>
      </div>

      <!-- Pending Organizers Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50 border-b border-border">
            <tr>
              <th class="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</th>
              <th class="text-left px-4 py-3 text-sm font-semibold text-foreground">Email</th>
              <th class="text-left px-4 py-3 text-sm font-semibold text-foreground">Business</th>
              <th class="text-left px-4 py-3 text-sm font-semibold text-foreground">Phone</th>
              <th class="text-right px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="organizer in pendingOrganizers"
              :key="organizer.id"
              class="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3 text-sm font-medium text-foreground">
                {{ organizer.fullName }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ organizer.email }}
              </td>
              <td class="px-4 py-3 text-sm text-foreground">
                <div>{{ organizer.businessName }}</div>
                <div class="text-xs text-muted-foreground">{{ organizer.businessEmail }}</div>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ organizer.phoneNumber }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    class="btn-primary px-3 py-1.5 text-xs"
                    @click="handleApprove(organizer.id)"
                    :disabled="loading"
                  >
                    Approve
                  </button>
                  <button
                    class="btn-outline px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                    @click="handleReject(organizer.id)"
                    :disabled="loading"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Events -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-h3 font-bold">
            Recent Events
          </h3>
          <router-link to="/admin/events" class="text-xs text-primary hover:underline">
            View all
          </router-link>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading && events.length === 0" class="text-center py-8">
          <p class="text-muted-foreground">Loading events...</p>
        </div>

        <!-- Events List -->
        <div v-else-if="events.length > 0" class="space-y-3">
          <div
            v-for="event in events.slice(0, 5)"
            :key="event.eventId"
            class="flex items-center justify-between p-3 bg-muted/60 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <div class="flex-1">
              <div class="font-medium text-sm">{{ event.title }}</div>
              <div class="text-xs text-muted-foreground">{{ event.venue }} • {{ formatDate(event.startDate) }}</div>
            </div>
            <span
              :class="[
                'px-2 py-1 rounded text-xs font-medium',
                event.status === 'Published' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              ]"
            >
              {{ event.status }}
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <p class="text-muted-foreground">No events found</p>
        </div>
      </div>

      <!-- User Activity -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-h3 font-bold">
            User Activity (Last 7 Days)
          </h3>
          <span class="px-3 py-1 rounded-full bg-accent/10 text-xs font-semibold text-accent-foreground border border-accent/30">Live</span>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">New Users</span>
            <span class="text-primary font-bold">+{{ Math.floor(totalUsersCount * 0.027) }}</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style="width: 78%" />
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Active Events</span>
            <span class="text-accent font-bold">+{{ Math.floor(totalEventsCount * 0.125) }}</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div class="bg-accent h-2 rounded-full" style="width: 65%" />
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Transactions</span>
            <span class="text-foreground font-bold">+{{ Math.floor(totalEventsCount * 0.714) }}</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r from-foreground/80 to-foreground/60 h-2 rounded-full" style="width: 92%" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link
        to="/admin/users"
        class="card hover:shadow-2xl transition-shadow text-center p-6 cursor-pointer hover:bg-sidebar-accent"
      >
        <div class="text-4xl mb-3">
          👥
        </div>
        <h4 class="font-semibold">
          Manage Users
        </h4>
        <p class="text-sm text-muted-foreground">
          {{ totalUsersCount.toLocaleString() }} users
        </p>
      </router-link>
      <router-link
        to="/admin/organizers"
        class="card hover:shadow-2xl transition-shadow text-center p-6 cursor-pointer hover:bg-sidebar-accent relative"
      >
        <div v-if="pendingOrganizersCount > 0" class="absolute top-2 right-2 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold">
          {{ pendingOrganizersCount }}
        </div>
        <div class="text-4xl mb-3">
          🏢
        </div>
        <h4 class="font-semibold">
          Organizers
        </h4>
        <p class="text-sm text-muted-foreground">
          {{ activeOrganizersCount.toLocaleString() }} organizers
        </p>
      </router-link>
      <router-link
        to="/admin/events"
        class="card hover:shadow-2xl transition-shadow text-center p-6 cursor-pointer hover:bg-sidebar-accent"
      >
        <div class="text-4xl mb-3">
          🎪
        </div>
        <h4 class="font-semibold">
          Events
        </h4>
        <p class="text-sm text-muted-foreground">
          {{ totalEventsCount.toLocaleString() }} events
        </p>
      </router-link>
      <router-link
        to="/admin/reports"
        class="card hover:shadow-2xl transition-shadow text-center p-6 cursor-pointer hover:bg-sidebar-accent"
      >
        <div class="text-4xl mb-3">
          📊
        </div>
        <h4 class="font-semibold">
          Reports
        </h4>
        <p class="text-sm text-muted-foreground">
          View analytics
        </p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'
import StatCard from '@/components/StatCard.vue'

const adminStore = useAdminStore()

// Computed properties from store
const pendingOrganizers = computed(() => adminStore.pendingOrganizers)
const events = computed(() => adminStore.events)
const loading = computed(() => adminStore.loading)
const pendingOrganizersCount = computed(() => adminStore.pendingOrganizersCount)
const totalUsersCount = computed(() => adminStore.totalUsersCount)
const totalEventsCount = computed(() => adminStore.totalEventsCount)
const activeOrganizersCount = computed(() => adminStore.activeOrganizersCount)

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    adminStore.fetchPendingOrganizers({ pageSize: 10 }),
    adminStore.fetchAllOrganizers({ pageSize: 100 }),
    adminStore.fetchAllUsers({ pageSize: 1 }), // Just to get count
    adminStore.fetchAllEvents(),
  ])
})

// Handle approve
const handleApprove = async (id) => {
  const confirmed = confirm('Are you sure you want to approve this organizer?')
  if (confirmed) {
    const result = await adminStore.approveOrganizer(id)
    if (result.success) {
      alert('Organizer approved successfully!')
    } else {
      alert(`Failed to approve: ${result.message}`)
    }
  }
}

// Handle reject
const handleReject = async (id) => {
  const confirmed = confirm('Are you sure you want to reject this organizer?')
  if (confirmed) {
    const result = await adminStore.rejectOrganizer(id)
    if (result.success) {
      alert('Organizer rejected successfully!')
    } else {
      alert(`Failed to reject: ${result.message}`)
    }
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
</script>
