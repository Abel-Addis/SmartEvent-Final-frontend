<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-h2 font-bold">
          User Management
        </h2>
        <p class="text-muted-foreground">
          Manage all platform users ({{ totalCount.toLocaleString() }} total)
        </p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card p-4 sm:p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Search Users</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Name, email, phone..."
            class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            @keyup.enter="applyFilters"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Role</label>
          <select
            v-model="filterRole"
            class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">
              All Roles
            </option>
            <option value="Attendee">
              Attendee
            </option>
            <option value="Organizer">
              Organizer
            </option>
            <option value="Admin">
              Admin
            </option>
            <option value="SuperAdmin">
              Super Admin
            </option>
            <option value="GatePerson">
              Gate Person
            </option>
          </select>
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
            <option value="Active">
              Active
            </option>
            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            class="w-full btn-primary"
            @click="applyFilters"
        :disabled="usersLoading"
          >
        {{ usersLoading ? 'Searching...' : 'Apply Filters' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="usersLoading && users.length === 0" class="card text-center py-12">
      <p class="text-muted-foreground">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-4 border border-destructive bg-destructive/10">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <!-- Users Table -->
    <div v-else class="card overflow-x-auto">
      <table class="w-full">
        <thead class="border-b border-border bg-muted">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              User
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Email
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Phone
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Role
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Join Date
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Status
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b border-border hover:bg-muted/50 transition-colors"
          >
            <td class="px-4 py-3 font-medium">
              {{ user.fullName }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ user.email }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ user.phoneNumber }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  user.role === 'Organizer' ? 'bg-primary/10 text-primary' :
                  user.role === 'Admin' ? 'bg-accent/10 text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                ]"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  user.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                ]"
              >
                {{ user.status }}
              </span>
            </td>
            <td class="px-4 py-3 flex gap-2">
              <button
                class="btn-outline px-3 py-1 text-sm rounded-lg"
                @click="openBookingsModal(user)"
              >
                Bookings
              </button>
              <button
                :class="[
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  user.status === 'Active' ? 'btn-outline text-destructive hover:bg-destructive/10' : 'btn-primary'
                ]"
                @click="toggleUserStatus(user.id, user.status === 'Active')"
                :disabled="statusLoading"
              >
                {{ user.status === 'Active' ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0 && !loading" class="text-center py-12">
        <p class="text-muted-foreground">No users found</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} users
      </p>
      <div class="flex gap-2">
        <button
          class="btn-outline px-3 py-1 text-sm"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || usersLoading"
        >
          Previous
        </button>
        <span class="px-3 py-1 text-sm">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          class="btn-outline px-3 py-1 text-sm"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages || usersLoading"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Bookings Modal -->
    <div v-if="showBookingsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-card w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border flex flex-col">
        <div class="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <div>
            <h3 class="text-xl font-bold">User Bookings</h3>
            <p class="text-sm text-muted-foreground" v-if="selectedUser">History for {{ selectedUser.fullName }}</p>
          </div>
          <button @click="closeBookingsModal" class="p-2 hover:bg-muted rounded-full">✕</button>
        </div>
        
        <div class="p-6 flex-1 overflow-auto">
          <div v-if="bookingsLoading" class="text-center py-12 text-muted-foreground">
            Loading bookings...
          </div>
          <div v-else-if="userBookings.length === 0" class="text-center py-12 text-muted-foreground">
            No bookings found for this user.
          </div>
          <table v-else class="w-full">
            <thead class="border-b border-border">
              <tr>
                <th class="text-left py-2 px-3 text-sm font-medium">Event</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Date</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Ticket</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Quantity</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Amount</th>
                <th class="text-left py-2 px-3 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in userBookings" :key="booking.id" class="border-b border-border/50 hover:bg-muted/30">
                <td class="py-3 px-3 font-medium">{{ booking.eventName }}</td>
                <td class="py-3 px-3 text-sm text-muted-foreground">{{ formatDate(booking.date) }}</td>
                <td class="py-3 px-3 text-sm">{{ booking.ticketTypeName }}</td>
                <td class="py-3 px-3 text-sm">{{ booking.quantity }}</td>
                <td class="py-3 px-3 text-sm font-bold">{{ booking.totalPrice }} ETB</td>
                <td class="py-3 px-3">
                  <span :class="['px-2 py-0.5 rounded text-xs', booking.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700']">
                    {{ booking.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-4 border-t border-border bg-muted/20 flex justify-end">
          <button class="btn-outline px-4 py-2" @click="closeBookingsModal">Close</button>
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
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// Bookings Modal State
const showBookingsModal = ref(false)
const userBookings = ref([])
const bookingsLoading = ref(false)
const selectedUser = ref(null)

// Computed properties from store
const users = computed(() => adminStore.users)
const loading = computed(() => adminStore.loading) // global loading (other actions)
const usersLoading = computed(() => adminStore.usersLoading) // list/filter loading
const statusLoading = computed(() => adminStore.statusLoading) // status toggle loading
const error = computed(() => adminStore.error)
const totalCount = computed(() => adminStore.usersPagination.totalCount)
const totalPages = computed(() => adminStore.usersPagination.totalPages)

// Fetch users on mount
onMounted(async () => {
  await fetchUsers()
})

// Fetch users with current filters
const fetchUsers = async () => {
  const pageParams = {
    pageNumber: currentPage.value,
    pageSize: pageSize.value,
  }
  const roleParam = filterRole.value ? filterRole.value.trim() : ""
  const statusParam = filterStatus.value ? filterStatus.value.trim() : ""

  // If search query exists, use search endpoint
  const q = searchQuery.value.trim()
  if (q) {
    // backend ANDs fields; only send one field based on pattern to avoid no-results
    const looksLikeEmail = q.includes('@')
    const looksLikePhone = /^\+?[0-9\s()-]{5,}$/.test(q)

    const searchParams = {
      ...(looksLikeEmail && { email: q }),
      ...(looksLikePhone && !looksLikeEmail && { phoneNumber: q }),
      ...(!looksLikeEmail && !looksLikePhone && { fullName: q }),
      ...(roleParam && { role: roleParam }),
      ...(statusParam && { status: statusParam }),
    }
    await adminStore.searchUsers(searchParams, pageParams)
  } else {
    // Otherwise use getAllUsers with filters
    const params = {
      ...pageParams,
      ...(roleParam && { role: roleParam }),
      ...(statusParam && { status: statusParam }),
    }
    await adminStore.fetchAllUsers(params)
  }
}

// Apply filters
const applyFilters = async () => {
  currentPage.value = 1 // Reset to first page
  await fetchUsers()
}

// Change page
const changePage = async (page) => {
  currentPage.value = page
  await fetchUsers()
}

// Toggle user status
const toggleUserStatus = async (userId, isCurrentlyActive) => {
  const action = isCurrentlyActive ? 'deactivate' : 'activate'
  const confirmed = confirm(`Are you sure you want to ${action} this user?`)
  
  if (confirmed) {
    const result = await adminStore.updateUserStatus(userId, !isCurrentlyActive)
    if (result.success) {
      alert(`User ${action}d successfully!`)
    } else {
      alert(`Failed to ${action} user: ${result.message}`)
    }
  }
}

// Open Bookings Modal
const openBookingsModal = async (user) => {
  selectedUser.value = user
  showBookingsModal.value = true
  bookingsLoading.value = true
  userBookings.value = []
  
  try {
    const bookings = await adminService.getUserBookings(user.id)
    userBookings.value = bookings || []
  } catch (err) {
    alert('Failed to load user bookings')
  } finally {
    bookingsLoading.value = false
  }
}

const closeBookingsModal = () => {
  showBookingsModal.value = false
  setTimeout(() => {
    selectedUser.value = null
    userBookings.value = []
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
