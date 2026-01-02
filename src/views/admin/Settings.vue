<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-h2 font-bold">
        Admin Settings
      </h2>
      <p class="text-muted-foreground">
        Manage platform configuration and preferences
      </p>
    </div>

    <!-- Settings Tabs -->
    <div class="card flex border-b border-border overflow-x-auto">
      <button
        v-for="tab in settingsTabs"
        :key="tab.id"
        :class="['px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap', selectedTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground']"
        @click="selectedTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Platform Settings -->
    <div
      v-if="selectedTab === 'platform'"
      class="space-y-6"
    >
      <div class="card p-6 space-y-4">
        <h3 class="text-h3 font-bold">
          Platform Configuration
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Credit Price (ETB)</label>
            <input
              v-model.number="settings.creditPriceETB"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Initial Organizer Credits</label>
            <input
              v-model.number="settings.initialOrganizerCredits"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Event Publish Cost (credits)</label>
            <input
              v-model.number="settings.eventPublishCost"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class="btn-primary px-6 py-2"
            @click="saveSettings"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
          <button
            class="btn-outline px-6 py-2"
            @click="resetSettings"
            :disabled="saving"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="card p-6 space-y-4">
        <h3 class="text-h3 font-bold">
          Add Credits to Organizer
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Organizer</label>
            <select
              v-model="creditForm.userId"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="">
                Select organizer
              </option>
              <option
                v-for="org in organizers"
                :key="org.id"
                :value="org.id"
              >
                {{ org.fullName }} ({{ org.email }})
              </option>
            </select>
            <p v-if="organizersLoading" class="text-xs text-muted-foreground mt-1">Loading organizers...</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Credits</label>
            <input
              v-model.number="creditForm.credits"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Reason (optional)</label>
            <input
              v-model="creditForm.reason"
              type="text"
              placeholder="Bonus / Adjustment"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class="btn-primary px-6 py-2"
            @click="addCredits"
            :disabled="creditSaving"
          >
            {{ creditSaving ? 'Processing...' : 'Add Credits' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Boost Levels -->
    <div
      v-if="selectedTab === 'boost'"
      class="space-y-6"
    >
      <div v-if="boostLevelsLoading" class="text-center py-12 text-muted-foreground">
        Loading boost levels...
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="level in boostLevels" 
          :key="level.id"
          class="card p-6 space-y-4 border border-border relative overflow-hidden"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold flex items-center gap-2">
                {{ level.name }}
                <span :class="['text-xs px-2 py-0.5 rounded-full', level.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground']">
                  {{ level.isActive ? 'Active' : 'Inactive' }}
                </span>
              </h3>
              <p class="text-muted-foreground text-sm mt-1">{{ level.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 py-2">
            <div>
              <p class="text-xs text-muted-foreground uppercase">Cost</p>
              <p class="font-bold">{{ level.creditCost }} Credits</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase">Duration</p>
              <p class="font-bold">{{ level.durationHours }} Hours</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase">Weight</p>
              <p class="font-bold">{{ level.weight }}x</p>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button class="btn-primary flex-1 py-1.5 text-sm" @click="editBoostLevel(level)">
              Edit
            </button>
            <button 
              class="btn-outline flex-1 py-1.5 text-sm" 
              @click="toggleBoostStatus(level)"
            >
              {{ level.isActive ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Boost Level Modal -->
      <div v-if="editingBoost" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-card w-full max-w-lg rounded-xl shadow-2xl p-6 space-y-4 border border-border">
          <h3 class="text-xl font-bold">Edit Boost Level</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input v-model="editingBoost.name" class="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <textarea v-model="editingBoost.description" class="w-full px-3 py-2 border rounded-lg bg-background" rows="2"></textarea>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Credits</label>
                <input v-model.number="editingBoost.creditCost" type="number" class="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Duration (Hrs)</label>
                <input v-model.number="editingBoost.durationHours" type="number" class="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Weight</label>
                <input v-model.number="editingBoost.weight" type="number" class="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn-outline px-4 py-2" @click="editingBoost = null">Cancel</button>
            <button class="btn-primary px-4 py-2" @click="saveBoostLevel">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Recommendation -->
    <div
      v-if="selectedTab === 'recommendation'"
      class="space-y-6"
    >
      <div v-if="loadingMetrics" class="text-center py-12 text-muted-foreground">
        Loading recommendation metrics...
      </div>
      <div v-else class="space-y-6">
        <!-- Model Stats -->
        <div class="card p-6 border-l-4 border-purple-500">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 class="font-bold flex items-center gap-2 text-lg">
                <span>🤖</span> Recommendation Model
              </h3>
              <p class="text-sm text-muted-foreground">Version: {{ metrics?.modelVersion || 'v1.0' }}</p>
            </div>
            <button 
              class="btn-primary flex items-center gap-2" 
              @click="retrainModel"
              :disabled="retraining"
            >
              <span v-if="retraining" class="animate-spin">🔄</span>
              <span>{{ retraining ? 'Retraining...' : 'Retrain Global Model' }}</span>
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-muted/30 p-3 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase">Accuracy</p>
              <p class="text-xl font-bold text-purple-600">{{ (metrics?.mlAccuracy * 100).toFixed(1) }}%</p>
            </div>
            <div class="bg-muted/30 p-3 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase">RMSE</p>
              <p class="text-xl font-bold">{{ metrics?.mlRmse?.toFixed(4) }}</p>
            </div>
            <div class="bg-muted/30 p-3 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase">Last Trained</p>
              <p class="text-sm font-medium">{{ metrics?.lastTrained ? new Date(metrics.lastTrained).toLocaleDateString() : 'Never' }}</p>
            </div>
             <div class="bg-muted/30 p-3 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase">Interactions</p>
              <p class="text-xl font-bold">{{ metrics?.totalInteractions }}</p>
            </div>
          </div>
        </div>

        <!-- Distributions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card p-6">
            <h3 class="font-bold mb-4">Top Categories</h3>
            <div class="space-y-3">
              <div v-for="(count, category) in (metrics?.topCategories || {})" :key="category" class="space-y-1">
                <div class="flex justify-between text-sm">
                  <span>{{ category }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-purple-500" :style="{ width: `${Math.min(100, (count / metrics.totalEvents) * 100)}%` }"></div>
                </div>
              </div>
              <div v-if="!metrics?.topCategories || Object.keys(metrics.topCategories).length === 0" class="text-sm text-muted-foreground">
                No category data available.
              </div>
            </div>
          </div>

          <div class="card p-6">
             <h3 class="font-bold mb-4">Top Recommended Events</h3>
             <div class="space-y-3">
              <div v-for="(count, eventName) in (metrics?.topEvents || {})" :key="eventName" class="space-y-1">
                <div class="flex justify-between text-sm">
                  <span class="truncate pr-2">{{ eventName }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" :style="{ width: '50%' }"></div>
                </div>
              </div>
               <div v-if="!metrics?.topEvents || Object.keys(metrics.topEvents).length === 0" class="text-sm text-muted-foreground">
                No top event data available.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- System Health -->
    <div
      v-if="selectedTab === 'health'"
      class="space-y-6"
    >
      <div v-if="healthLoading" class="text-center py-12 text-muted-foreground">
        Checking system health...
      </div>
      <div v-else-if="healthData" class="space-y-6">
         <!-- Overall Status Cards -->
         <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Database -->
            <div class="card p-4 border-l-4" :class="healthData.Database?.status === 'Healthy' ? 'border-green-500' : 'border-red-500'">
                <div class="flex justify-between items-start">
                   <div>
                      <h4 class="font-bold">Database</h4>
                      <p class="text-sm text-muted-foreground">{{ healthData.Database?.status }}</p>
                   </div>
                   <span class="text-2xl">{{ healthData.Database?.status === 'Healthy' ? '🗄️' : '⚠️' }}</span>
                </div>
                <p v-if="healthData.Database?.responseTimeMs" class="text-xs mt-2">Response: {{ healthData.Database.responseTimeMs }}ms</p>
                <p v-if="healthData.Database?.error" class="text-xs text-red-600 mt-2">{{ healthData.Database.error }}</p>
            </div>

            <!-- API Performance -->
            <div class="card p-4 border-l-4 border-blue-500">
               <div class="flex justify-between items-start">
                   <div>
                      <h4 class="font-bold">API Performance</h4>
                      <p class="text-sm text-muted-foreground">Avg Response</p>
                   </div>
                   <span class="text-2xl">⚡</span>
                </div>
                 <p class="text-2xl font-bold mt-1">{{ healthData.ApiResponseTime?.lastAverageMs || 0 }}ms</p>
            </div>

            <!-- System Resources -->
            <div class="card p-4 border-l-4 border-purple-500">
               <div class="flex justify-between items-start">
                   <div>
                      <h4 class="font-bold">System Status</h4>
                      <p class="text-sm text-muted-foreground">Uptime: {{ (healthData.System?.uptimeMinutes || 0).toFixed(0) }}m</p>
                   </div>
                   <span class="text-2xl">🖥️</span>
                </div>
                <p class="text-xs mt-2">Memory: {{ healthData.System?.memoryMB }}MB</p>
                <p class="text-xs">Cores: {{ healthData.System?.cpuCores }}</p>
            </div>
         </div>

         <!-- Services Grid -->
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- External Services -->
            <div class="card p-6">
               <h3 class="font-bold mb-4">External Services</h3>
               <div class="space-y-4">
                  <!-- Cloudinary -->
                  <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                     <div class="flex items-center gap-3">
                        <span class="text-xl">☁️</span>
                        <div>
                           <p class="font-medium">Cloudinary</p>
                           <p class="text-xs text-muted-foreground">File Storage</p>
                        </div>
                     </div>
                     <div class="text-right">
                        <span 
                           class="px-2 py-1 rounded-full text-xs font-bold"
                           :class="(healthData['Cloudinary-File-Upload'] || healthData.Cloudinary)?.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        >
                           {{ (healthData['Cloudinary-File-Upload'] || healthData.Cloudinary)?.status }}
                        </span>
                     </div>
                  </div>

                   <!-- Payment Service -->
                   <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                     <div class="flex items-center gap-3">
                        <span class="text-xl">💳</span>
                        <div>
                           <p class="font-medium">Payment Service</p>
                           <p class="text-xs text-muted-foreground">Chapa Gateway</p>
                        </div>
                     </div>
                     <div class="text-right">
                        <span 
                           class="px-2 py-1 rounded-full text-xs font-bold"
                           :class="healthData.PaymentService?.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        >
                           {{ healthData.PaymentService?.status }}
                        </span>
                        <p v-if="healthData.PaymentService?.statusCode" class="text-[10px] text-muted-foreground mt-1">Status: {{ healthData.PaymentService.statusCode }}</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Background Services -->
            <div class="card p-6">
               <h3 class="font-bold mb-4">Background Services</h3>
               <div class="space-y-4">
                   <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span class="font-medium">Job Queue</span>
                      <span class="font-mono bg-background px-2 py-1 rounded border">{{ healthData.BackgroundQueue?.pending || 0 }} Pending</span>
                   </div>
                   
                   <div v-for="(svc, idx) in healthData.BackgroundServices" :key="idx" class="flex items-center justify-between text-sm py-2 border-b last:border-0 border-border/50">
                      <span>{{ svc.service }}</span>
                      <span class="text-muted-foreground">Last Run: {{ new Date(svc.lastRun).toLocaleTimeString() }}</span>
                   </div>
                   
                   <div v-if="!healthData.BackgroundServices?.length" class="text-sm text-muted-foreground text-center py-2">
                      No background services tracked.
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { adminService } from '@/services/adminService'

const selectedTab = ref('platform')

const settingsTabs = [
  { id: 'platform', label: 'Platform' },
  { id: 'boost', label: 'Boost Levels' },
  { id: 'health', label: 'System Health' },
  { id: 'recommendation', label: 'AI Recommendation' },
]

const settings = ref({
  creditPriceETB: 0,
  initialOrganizerCredits: 0,
  eventPublishCost: 0,
})

const creditForm = ref({
  userId: '',
  credits: 0,
  reason: '',
})

// Boost Levels State
const boostLevels = ref([])
const boostLevelsLoading = ref(false)
const editingBoost = ref(null)

// System Health State
const healthData = ref(null)
const healthLoading = ref(false)

// Recommendation State
const metrics = ref(null)
const loadingMetrics = ref(false)
const retraining = ref(false)

const organizers = ref([])
const organizersLoading = ref(false)

const saving = ref(false)
const creditSaving = ref(false)
const initialSettings = ref(null)

const fetchSettings = async () => {
  try {
    const data = await adminService.getPlatformSettings()
    if (data) {
      settings.value = {
        creditPriceETB: data.creditPriceETB ?? 0,
        initialOrganizerCredits: data.initialOrganizerCredits ?? 0,
        eventPublishCost: data.eventPublishCost ?? 0,
      }
      initialSettings.value = { ...settings.value }
    }
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to load settings')
  }
}

const fetchOrganizers = async () => {
  if (organizers.value.length) return
  organizersLoading.value = true
  try {
    const res = await adminService.getAllOrganizers({
      pageNumber: 1,
      pageSize: 200,
    })
    organizers.value = res.items || []
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to load organizers')
  } finally {
    organizersLoading.value = false
  }
}

const fetchBoostLevels = async () => {
  boostLevelsLoading.value = true
  try {
    const data = await adminService.getAllBoostLevels()
    boostLevels.value = data || []
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to load boost levels')
  } finally {
    boostLevelsLoading.value = false
  }
}

const fetchHealth = async () => {
  healthLoading.value = true
  try {
    const data = await adminService.getSystemHealth()
    healthData.value = data
  } catch (err) {
    console.error(err)
    alert('Failed to check system health')
  } finally {
    healthLoading.value = false
  }
}

const fetchMetrics = async () => {
  loadingMetrics.value = true
  try {
    const data = await adminService.getRecommendationMetrics()
    metrics.value = data
  } catch (err) {
    alert('Failed to load recommendation metrics')
  } finally {
    loadingMetrics.value = false
  }
}

const retrainModel = async () => {
  if (!confirm('Are you sure you want to retrain the global model? This might take a while.')) return
  retraining.value = true
  try {
    await adminService.retrainGlobalModel()
    alert('Model retraining started/completed successfully.')
    await fetchMetrics()
  } catch (err) {
     alert(err.response?.data?.message || 'Failed to retrain model')
  } finally {
    retraining.value = false
  }
}

// Watch tab selection to load data on demand
watch(selectedTab, async (newTab) => {
  if (newTab === 'boost') {
    await fetchBoostLevels()
  } else if (newTab === 'health') {
    await fetchHealth()
  } else if (newTab === 'recommendation') {
    await fetchMetrics()
  }
})

const saveSettings = async () => {
  try {
    saving.value = true
    await adminService.updatePlatformSettings({
      creditPriceETB: Number(settings.value.creditPriceETB) || 0,
      initialOrganizerCredits: Number(settings.value.initialOrganizerCredits) || 0,
      eventPublishCost: Number(settings.value.eventPublishCost) || 0,
    })
    alert('Settings saved successfully')
    initialSettings.value = { ...settings.value }
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  if (initialSettings.value) {
    settings.value = { ...initialSettings.value }
  }
}

const addCredits = async () => {
  if (!creditForm.value.userId || !creditForm.value.credits) {
    alert('Organizer and credits are required')
    return
  }
  try {
    creditSaving.value = true
    await adminService.addCreditToOrganizer({
      userId: creditForm.value.userId,
      credits: creditForm.value.credits,
      reason: creditForm.value.reason,
    })
    alert('Credits added successfully')
    creditForm.value = { userId: '', credits: 0, reason: '' }
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to add credits')
  } finally {
    creditSaving.value = false
  }
}

const editBoostLevel = (level) => {
  editingBoost.value = { ...level }
}

const saveBoostLevel = async () => {
  try {
    await adminService.updateBoostLevel(editingBoost.value)
    alert('Boost level updated successfully')
    editingBoost.value = null
    await fetchBoostLevels()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update boost level')
  }
}

const toggleBoostStatus = async (level) => {
  try {
    await adminService.setBoostLevelStatus(level.id, !level.isActive)
     await fetchBoostLevels()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update status')
  }
}

onMounted(async () => {
  await Promise.all([fetchSettings(), fetchOrganizers()])
})
</script>
