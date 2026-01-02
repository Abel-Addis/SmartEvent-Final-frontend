<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-h2 font-bold">
          Organizer Management
        </h2>
        <p class="text-muted-foreground">
          Manage and approve event organizers
        </p>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="card p-4">
      <div class="flex gap-2">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeFilter === status.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          ]"
          @click="changeFilter(status.value)"
        >
          {{ status.label }}
          <span v-if="status.value === 'pending' && pendingCount > 0" class="ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs">
            {{ pendingCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && displayedOrganizers.length === 0" class="card text-center py-12">
      <p class="text-muted-foreground">Loading organizers...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-4 border border-destructive bg-destructive/10">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <!-- Pending Organizers -->
    <div
      v-else-if="activeFilter === 'pending' && pendingOrganizers.length > 0"
      class="card bg-muted/50 border border-border"
    >
      <div class="flex items-start gap-3">
        <span class="text-2xl">⚠️</span>
        <div class="flex-1">
          <h3 class="font-semibold mb-2">
            Pending Approvals
          </h3>
          <p class="text-sm text-muted-foreground mb-4">
            {{ pendingOrganizers.length }} organizers awaiting approval
          </p>
          <div class="space-y-2">
            <div
              v-for="org in pendingOrganizers"
              :key="org.id"
              class="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
            >
              <div class="flex-1">
                <p class="font-medium">
                  {{ org.fullName }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ org.email }}
                </p>
                <div class="mt-2 space-y-1">
                  <p class="text-xs text-muted-foreground">
                    <span class="font-medium">Business:</span> {{ org.businessName }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    <span class="font-medium">Business Email:</span> {{ org.businessEmail }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    <span class="font-medium">Phone:</span> {{ org.phoneNumber }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="btn-primary px-4 py-2 text-sm"
                  @click="handleApprove(org.id)"
                  :disabled="loading"
                >
                  Approve
                </button>
                <button
                  class="btn-outline px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  @click="handleReject(org.id)"
                  :disabled="loading"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Pending State -->
    <div v-else-if="activeFilter === 'pending' && pendingOrganizers.length === 0" class="card text-center py-12">
      <div class="text-4xl mb-4">✅</div>
      <p class="text-muted-foreground">No pending approvals</p>
    </div>

    <!-- All Organizers Table -->
    <div v-else-if="activeFilter === 'all'" class="card overflow-x-auto">
      <table class="w-full">
        <thead class="border-b border-border bg-muted">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Name
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Email
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Phone
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Status
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Join Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="org in displayedOrganizers"
            :key="org.id"
            class="border-b border-border hover:bg-muted/50 transition-colors"
          >
            <td class="px-4 py-3 font-medium">
              {{ org.fullName }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ org.email }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ org.phoneNumber }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  org.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                ]"
              >
                {{ org.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ formatDate(org.createdAt) }}
            </td>
            <td class="px-4 py-3 flex gap-2">
              <button
                class="btn-outline px-3 py-1 text-sm rounded-lg"
                @click="openEventsModal(org)"
              >
                Events
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="displayedOrganizers.length === 0 && !loading" class="text-center py-12">
        <p class="text-muted-foreground">No organizers found</p>
      </div>
    </div>

    <!-- Approved Organizers Grid -->
    <div v-else-if="activeFilter === 'approved'" class="card">
      <h3 class="text-h3 font-bold mb-6">
        Approved Organizers
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="org in displayedOrganizers"
          :key="org.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h4 class="font-semibold">
                {{ org.fullName }}
              </h4>
              <p class="text-sm text-muted-foreground">
                {{ org.role }}
              </p>
            </div>
            <span class="text-2xl">🏢</span>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            {{ org.email }}
          </p>
          <div class="flex justify-between items-center">
             <p class="text-xs text-muted-foreground">
              Joined {{ formatDate(org.createdAt) }}
            </p>
            <button
              class="text-xs btn-outline px-2 py-1"
              @click="openEventsModal(org)"
            >
              View Events
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayedOrganizers.length === 0 && !loading" class="text-center py-12">
        <p class="text-muted-foreground">No approved organizers found</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && activeFilter === 'all'" class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} organizers
      </p>
      <div class="flex gap-2">
        <button
          class="btn-outline px-3 py-1 text-sm"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || loading"
        >
          Previous
        </button>
        <span class="px-3 py-1 text-sm">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          class="btn-outline px-3 py-1 text-sm"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages || loading"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Events Modal -->
     <div v-if="showEventsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-card w-full max-w-5xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border flex flex-col">
        <div class="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <div>
            <h3 class="text-xl font-bold">Organizer Events</h3>
            <p class="text-sm text-muted-foreground" v-if="selectedOrg">Events by {{ selectedOrg.fullName }}</p>
          </div>
          <button @click="closeEventsModal" class="p-2 hover:bg-muted rounded-full">✕</button>
        </div>
        
        <div class="p-6 flex-1 overflow-auto">
          <div v-if="eventsLoading" class="text-center py-12 text-muted-foreground">
            Loading events...
          </div>
          <div v-else-if="orgEvents.length === 0" class="text-center py-12 text-muted-foreground">
            No events found for this organizer.
          </div>
          <table v-else class="w-full">
            <thead class="border-b border-border">
              <tr>
                <th class="text-left py-2 px-3 text-sm font-medium">Title</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Date</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Location</th>
                 <th class="text-left py-2 px-3 text-sm font-medium">Category</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in orgEvents" :key="ev.id" class="border-b border-border/50 hover:bg-muted/30">
                <td class="py-3 px-3 font-medium">{{ ev.title }}</td>
                <td class="py-3 px-3 text-sm text-muted-foreground">{{ formatDate(ev.startDate) }}</td>
                <td class="py-3 px-3 text-sm">{{ ev.locationName || 'Online' }}</td>
                <td class="py-3 px-3 text-sm">{{ ev.categoryName }}</td>
                <td class="py-3 px-3">
                  <span :class="['px-2 py-0.5 rounded text-xs', ev.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                    {{ ev.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-4 border-t border-border bg-muted/20 flex justify-end">
          <button class="btn-outline px-4 py-2" @click="closeEventsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'
import { adminService } from '@/services/adminService'

const adminStore = useAdminStore()

// Local state
const activeFilter = ref('pending')
const currentPage = ref(1)
const pageSize = ref(20)

// Events Modal State
const showEventsModal = ref(false)
const orgEvents = ref([])
const eventsLoading = ref(false)
const selectedOrg = ref(null)

const statusFilters = [
  { label: 'Pending', value: 'pending' },
  { label: 'All Organizers', value: 'all' },
  { label: 'Approved', value: 'approved' },
]

// Computed properties from store
const pendingOrganizers = computed(() => adminStore.pendingOrganizers)
const allOrganizers = computed(() => adminStore.allOrganizers)
const loading = computed(() => adminStore.loading)
const error = computed(() => adminStore.error)
const pendingCount = computed(() => adminStore.pendingOrganizersCount)
const totalCount = computed(() => allOrganizers.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Displayed organizers based on active filter
const displayedOrganizers = computed(() => {
  if (activeFilter.value === 'pending') {
    return pendingOrganizers.value
  } else if (activeFilter.value === 'approved') {
    return allOrganizers.value.filter(o => o.status === 'Active')
  } else {
    return allOrganizers.value
  }
})

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    adminStore.fetchPendingOrganizers({ pageSize: 100 }),
    adminStore.fetchAllOrganizers({ pageSize: 100 }),
  ])
})

// Change filter
const changeFilter = async (filter) => {
  activeFilter.value = filter
  currentPage.value = 1
  
  if (filter === 'pending') {
    await adminStore.fetchPendingOrganizers({ pageSize: 100 })
  } else {
    await adminStore.fetchAllOrganizers({ 
      pageSize: 100,
      ...(filter === 'approved' && { status: 'Active' })
    })
  }
}

// Change page
const changePage = (page) => {
  currentPage.value = page
}

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
  const confirmed = confirm('Are you sure you want to reject this organizer? This action cannot be undone.')
  if (confirmed) {
    const result = await adminStore.rejectOrganizer(id)
    if (result.success) {
      alert('Organizer rejected successfully!')
    } else {
      alert(`Failed to reject: ${result.message}`)
    }
  }
}

// Open Events Modal
const openEventsModal = async (org) => {
  selectedOrg.value = org
  showEventsModal.value = true
  eventsLoading.value = true
  orgEvents.value = []
  
  try {
    const events = await adminService.getOrganizerEvents(org.id)
    orgEvents.value = events || []
  } catch (err) {
    alert('Failed to load organizer events')
  } finally {
    eventsLoading.value = false
  }
}

const closeEventsModal = () => {
  showEventsModal.value = false
  setTimeout(() => {
    selectedOrg.value = null
    orgEvents.value = []
  }, 300)
}

// Format date
const formatDate = (dateString, options = {}) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  })
}
</script>
