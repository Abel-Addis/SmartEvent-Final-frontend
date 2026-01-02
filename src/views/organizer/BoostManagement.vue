<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-h2 font-bold">Event Boosts</h1>
      <!-- Tab Switcher -->
      <div class="flex p-1 bg-muted rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentTab = tab.value"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            currentTab === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab 1: Apply Boost -->
    <div v-if="currentTab === 'apply'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <!-- Step 1: Select Event -->
        <div class="card space-y-4">
          <h2 class="text-h3 font-bold">1. Select Event</h2>
          <div v-if="loadingEvents" class="text-muted-foreground">Loading events...</div>
          <div v-else-if="events.length === 0" class="text-muted-foreground">
            You don't have any published events to boost.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="event in events"
              :key="event.eventId"
              @click="selectedEventId = event.eventId"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all hover:border-primary',
                selectedEventId === event.eventId ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'
              ]"
            >
              <h3 class="font-semibold truncate">{{ event.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ formatDate(event.startDate) }}</p>
              <p class="text-xs mt-2 text-muted-foreground">{{ event.location }}</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Select Boost Level -->
        <div class="card space-y-4">
          <h2 class="text-h3 font-bold">2. Select Boost Level</h2>
          <div v-if="loadingLevels" class="text-muted-foreground">Loading levels...</div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="level in boostLevels"
              :key="level.id"
              @click="selectedLevelId = level.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all hover:border-primary relative overflow-hidden',
                selectedLevelId === level.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'
              ]"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg">{{ level.name }}</h3>
                <span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                  {{ level.creditCost }} Credits
                </span>
              </div>
              <p class="text-sm text-muted-foreground mb-3">{{ level.description }}</p>
              <div class="flex items-center gap-2 text-xs font-medium text-foreground/80">
                <span>⏱ {{ level.durationHours }} Hours Duration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Summary -->
      <div class="lg:col-span-1">
        <div class="card sticky top-6 space-y-6">
          <h3 class="text-h3 font-bold">Summary</h3>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-muted-foreground">Selected Event</p>
              <p class="font-medium truncate">{{ selectedEvent?.title || 'None selected' }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Boost Level</p>
              <p class="font-medium">{{ selectedLevel?.name || 'None selected' }}</p>
            </div>
            <div class="pt-4 border-t border-border flex justify-between items-center">
              <span class="font-bold">Total Cost</span>
              <span class="text-xl font-bold text-primary">{{ selectedLevel?.creditCost || 0 }} Credits</span>
            </div>
          </div>

          <button
            class="btn-primary w-full py-3"
            @click="handleApplyBoost"
            :disabled="!isValid || submitting"
          >
            {{ submitting ? 'Boosting...' : 'Boost Event' }}
          </button>
          
          <p v-if="error" class="text-destructive text-sm text-center">{{ error }}</p>
          <p v-if="successMsg" class="text-success text-sm text-center">{{ successMsg }}</p>
        </div>
      </div>
    </div>

    <!-- Tab 2: My Boosts -->
    <div v-else class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-h3 font-bold">My Boost History</h2>
        <button @click="loadMyBoosts" class="btn-outline text-sm">Refresh</button>
      </div>

      <div v-if="loadingHistory" class="text-center py-8 text-muted-foreground">
        Loading history...
      </div>
      <div v-else-if="myBoosts.length === 0" class="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        <div class="text-4xl mb-2">🚀</div>
        <p>No boosts found. Apply your first boost to get started!</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border text-muted-foreground text-sm">
              <th class="py-3 px-4">Event</th>
              <th class="py-3 px-4">Level</th>
              <th class="py-3 px-4">Cost</th>
              <th class="py-3 px-4">Start Time</th>
              <th class="py-3 px-4">End Time</th>
              <th class="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="boost in myBoosts" :key="boost.boostId" class="border-b border-border hover:bg-muted/50">
              <td class="py-3 px-4 font-medium">{{ boost.eventTitle }}</td>
              <td class="py-3 px-4">{{ boost.boostLevel }}</td>
              <td class="py-3 px-4">{{ boost.creditsUsed }} cr</td>
              <td class="py-3 px-4 text-sm">{{ formatDate(boost.startTime, true) }}</td>
              <td class="py-3 px-4 text-sm">{{ formatDate(boost.endTime, true) }}</td>
              <td class="py-3 px-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-bold',
                  boost.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                ]">
                  {{ boost.isActive ? 'Active' : 'Expired' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { boostService } from '../../services/boostService'
import { eventService } from '../../services/eventService'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const currentTab = ref('apply')
const tabs = [
  { label: 'Apply Boost', value: 'apply' },
  { label: 'My Boosts', value: 'history' }
]

// Apply Tab State
const events = ref([])
const boostLevels = ref([])
const selectedEventId = ref(null)
const selectedLevelId = ref(null)
const loadingEvents = ref(false)
const loadingLevels = ref(false)
const submitting = ref(false)
const error = ref('')
const successMsg = ref('')

// History Tab State
const myBoosts = ref([])
const loadingHistory = ref(false)

// Computed
const selectedEvent = computed(() => events.value.find(e => e.eventId === selectedEventId.value))
const selectedLevel = computed(() => boostLevels.value.find(l => l.id === selectedLevelId.value))
const isValid = computed(() => selectedEventId.value && selectedLevelId.value)
// Methods
const formatDate = (dateStr, includeTime = false) => {
  if (!dateStr) return ''
  const opts = { month: 'short', day: 'numeric', year: 'numeric' }
  if (includeTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return new Date(dateStr).toLocaleDateString('en-US', opts)
}

const loadData = async () => {
    loadingEvents.value = true
    loadingLevels.value = true
    try {
        // Assume user ID is in auth store
        const userId = authStore.user?.id
        
        // 1. Load active organizer events (published ones ideally)
        const organizerEvents = await eventService.getOrganizerDashboardEvents()
        events.value = organizerEvents || []
        
        
        
        // 2. Load boost levels
        const levels = await boostService.getBoostLevels()
        boostLevels.value = levels || []
        
    } catch (err) {
        console.error("Failed to load boost data", err)
        error.value = "Failed to load events or boost levels."
    } finally {
        loadingEvents.value = false
        loadingLevels.value = false
    }
}

const loadMyBoosts = async () => {
    loadingHistory.value = true
    try {
        const data = await boostService.getMyBoosts()
        myBoosts.value = data || []
    } catch (err) {
        console.error("Failed to load history", err)
    } finally {
        loadingHistory.value = false
    }
}

const handleApplyBoost = async () => {
    if (!isValid.value) return
    
    submitting.value = true
    error.value = ''
    successMsg.value = ''
    
    try {
        const result = await boostService.applyBoost({
            eventId: selectedEventId.value,
            boostLevelId: selectedLevelId.value
        })
        
        if (result && result.success) {
            successMsg.value = result.message || "Boost applied successfully!"
            selectedEventId.value = null
            selectedLevelId.value = null
            // Switch to history tab after short delay
            setTimeout(() => {
                currentTab.value = 'history'
            }, 1500)
        } else {
            error.value = result?.message || "Failed to apply boost."
        }
    } catch (err) {
        console.error(err)
        // Handle specific error like "Not enough credits"
        const msg = err.response?.data?.message || err.message
        error.value = msg || "An error occurred while applying boost."
    } finally {
        submitting.value = false
    }
}

// Watchers
watch(currentTab, (newVal) => {
    if (newVal === 'history') {
        loadMyBoosts()
    } else {
        // Reset or refresh options if needed
    }
})

// Lifecycle
onMounted(() => {
    loadData()
})

</script>
