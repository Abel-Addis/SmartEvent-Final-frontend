<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-h2 font-bold">
          Reports & Analytics
        </h2>
        <p class="text-muted-foreground">
          Platform performance and insights
        </p>
      </div>
      <div class="flex gap-2">
         <button
          v-if="activeTab === 'transactions'"
          class="btn-outline px-4 py-2"
          @click="downloadTransactionsCsv"
        >
          Export CSV
        </button>

      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-border">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['px-4 py-2 border-b-2 font-medium transition-colors', activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground']"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">


        <!-- Key Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <stat-card
            label="Total Revenue"
            :value="currency(totalRevenue)"
            icon="💰"
            :trend="revenueSummary.totalCreditsPurchased || 0"
          />
          <stat-card
            label="Credit Revenue"
            :value="currency(revenueSummary.totalCreditRevenueETB)"
            icon="📈"
            :trend="revenueSummary.totalCreditsPurchased || 0"
          />
          <stat-card
            label="Publish Revenue"
            :value="currency(revenueSummary.totalPublishRevenueETB)"
            icon="✓"
            :trend="revenueSummary.totalEventsPublished || 0"
          />
          <stat-card
            label="Boost Revenue"
            :value="currency(revenueSummary.totalBoostRevenueETB)"
            icon="⭐"
            :trend="revenueSummary.totalEventsBoosted || 0"
          />
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Operational Revenue Analysis -->
          <div class="card">
             <h3 class="text-h3 font-bold mb-4">Revenue Breakdown</h3>
             <div class="space-y-4">
                <div v-if="!revenueBreakdown.length" class="text-sm text-muted-foreground text-center py-8">
                   No transaction data available for analysis.
                </div>
                <!-- Breakdown List -->
                <div v-for="(item, idx) in revenueBreakdown" :key="idx" class="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                   <div class="flex items-center gap-3">
                      <div class="p-2 rounded-full bg-background border">
                         <span v-if="item.type === 'Purchase'">💰</span>
                         <span v-else-if="item.type === 'PublishEvent'">�</span>
                         <span v-else-if="item.type === 'BoostEvent'">🚀</span>
                         <span v-else-if="item.type === 'AdminAdd'">🔧</span>
                         <span v-else>📝</span>
                      </div>
                      <div>
                         <p class="font-medium text-sm">{{ item.type }}</p>
                         <p class="text-xs text-muted-foreground">{{ item.count }} transactions</p>
                      </div>
                   </div>
                   <div class="text-right">
                      <p class="font-bold font-mono" :class="item.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                         {{ currency(item.amount) }}
                      </p>
                      <p class="text-xs text-muted-foreground">{{ item.credits }} Credits</p>
                   </div>
                </div>
             </div>
          </div>

          <!-- User Acquisition -->
          <div class="card">
            <h3 class="text-h3 font-bold mb-4">User Acquisition</h3>
            <div class="space-y-4">
              <div v-for="source in userSources" :key="source.name" class="flex items-center gap-3">
                <div class="text-2xl">{{ source.icon }}</div>
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium">{{ source.name }}</span>
                    <span class="text-sm font-bold">{{ source.percentage }}%</span>
                  </div>
                  <div class="w-full bg-muted rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full" :style="{ width: source.percentage + '%' }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- Recent Reports -->
        <div class="card">
          <h3 class="text-h3 font-bold mb-4">Recent Reports</h3>
          <div class="space-y-2">
            <div v-for="report in recentReports" :key="report.id" class="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div>
                <p class="font-medium">{{ report.name }}</p>
                <p class="text-sm text-muted-foreground">Generated on {{ report.date }}</p>
              </div>
              <button class="btn-outline px-3 py-1 text-sm" @click="downloadReportFile(report.id)">
                Download
              </button>
            </div>
            <div v-if="recentReports.length === 0" class="text-center py-4 text-muted-foreground text-sm">
               No recent reports generated.
            </div>
          </div>
        </div>
    </div>

    <!-- Credit Transactions Tab -->
    <div v-if="activeTab === 'transactions'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div class="card p-4 sm:p-6">
          <h3 class="text-h3 font-bold mb-4">Transaction History</h3>
          
          <!-- Frontend Filter Bar -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
             <!-- Type Filter -->
             <div>
               <label class="block text-sm font-medium mb-1">Type</label>
               <select v-model="transFilter.type" class="input w-full px-3 py-2 border rounded-lg bg-background">
               <option value="">All Types</option>
                 <option value="Purchase">Purchase</option>
                 <option value="PublishEvent">Publish Event</option>
                 <option value="BoostEvent">Boost Event</option>
                 <option value="AdminAdd">Admin Adjustment</option>
               </select>
             </div>
             
             <!-- Date Filter -->
             <div>
                <label class="block text-sm font-medium mb-1">Timeframe</label>
                <select v-model="transFilter.timeframe" class="input w-full px-3 py-2 border rounded-lg bg-background">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                 <!-- Recent Reports -->

    </div>
             
             <!-- Search -->
             <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1">Search Organizer</label>
                <input v-model="transFilter.search" type="text" placeholder="Search by organizer name..." class="input w-full px-3 py-2 border rounded-lg bg-background" />
             </div>
          </div>

          <!-- Transactions Table -->
          <div class="overflow-x-auto border rounded-lg">
             <table class="w-full text-sm text-left">
                <thead class="bg-muted text-muted-foreground uppercase font-medium">
                   <tr>
                      <th class="px-4 py-3">Date</th>
                      <th class="px-4 py-3">Organizer</th>
                      <th class="px-4 py-3">Type</th>
                      <th class="px-4 py-3 text-right">Credits</th>
                      <th class="px-4 py-3 text-right">Amount</th>
                      <th class="px-4 py-3">Status</th>
                   </tr>
                </thead>
                <tbody v-if="loadingTransactions" class="divide-y divide-border">
                  <tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">Loading transactions...</td></tr>
                </tbody>
                <tbody v-else-if="filteredTransactions.length === 0" class="divide-y divide-border">
                   <tr><td colspan="6" class="px-4 py-8 text-center text-muted-foreground">No transactions found matching filters.</td></tr>
                </tbody>
                <tbody v-else class="divide-y divide-border">
                   <tr v-for="t in filteredTransactions" :key="t.id || Math.random()" class="hover:bg-muted/50 transition-colors">
                      <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(t.createdAt) }}</td>
                      <td class="px-4 py-3 font-medium">{{ t.organizerName || 'Unknown' }}</td>
                      <td class="px-4 py-3">
                         <span :class="getTypeBadgeClass(t.type)">{{ t.type }}</span>
                      </td>
                      <td class="px-4 py-3 text-right font-mono" :class="t.creditsChanged > 0 ? 'text-green-600' : 'text-red-600'">
                         {{ t.creditsChanged > 0 ? '+' : '' }}{{ t.creditsChanged }}
                      </td>
                      <td class="px-4 py-3 text-right font-mono">{{ t.totalAmount ? currency(t.totalAmount) : '-' }}</td>
                      <td class="px-4 py-3">
                         <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">{{ t.status }}</span>
                         <!-- Assuming status is mostly 'Completed' based on simple DTO, customize if backend sends Enum integers -->
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
          <div class="mt-4 text-xs text-muted-foreground text-right">
             Showing {{ filteredTransactions.length }} of {{ rawTransactions.length }} records
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { adminService } from '@/services/adminService'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Credit Transactions' }
]
const activeTab = ref('overview')

// --- Overview State ---
const reportType = ref('revenue')
const dateRange = ref('month')
const loading = ref(false)
const revenueSummary = ref({
  totalCreditRevenueETB: 0,
  totalCreditsPurchased: 0,
  totalPublishRevenueETB: 0,
  totalBoostRevenueETB: 0,
  totalEventsPublished: 0,
  totalEventsBoosted: 0,
})
const boostAnalytics = ref([])
const recentReports = ref([])

// --- Transactions State ---
const loadingTransactions = ref(false)
const rawTransactions = ref([])
const transFilter = ref({
  type: '',
  timeframe: 'all',
  search: ''
})

const currency = (v) => `ETB ${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const totalRevenue = computed(() =>
  (revenueSummary.value.totalCreditRevenueETB || 0) +
  (revenueSummary.value.totalPublishRevenueETB || 0) +
  (revenueSummary.value.totalBoostRevenueETB || 0)
)

const revenueBreakdown = computed(() => {
  if (!rawTransactions.value.length) return []
  
  // Group by Type
  const summary = {} // Type -> { count, amount, credits }
  
  rawTransactions.value.forEach(t => {
     const type = t.type || 'Unknown'
     if (!summary[type]) {
        summary[type] = { type, count: 0, amount: 0, credits: 0 }
     }
     summary[type].count++
     summary[type].amount += (t.totalAmount || 0)
     summary[type].credits += (t.creditsChanged || 0)
  })
  
  // Convert to array
  return Object.values(summary).sort((a,b) => b.amount - a.amount)
})

const userSources = computed(() => {
  if (!boostAnalytics.value.length) return []
  const max = boostAnalytics.value.reduce((sum, b) => sum + (b.totalTimesUsed || 0), 0) || 1
  return boostAnalytics.value.slice(0, 4).map(b => ({
     name: b.boostLevelName,
     icon: '⚡',
     percentage: Math.round(((b.totalTimesUsed || 0) / max) * 100)
  }))
})

// --- Data Fetching ---

const fetchData = async () => {
  loading.value = true
  try {
    const [rev, boosts] = await Promise.all([
      adminService.getPlatformRevenue(),
      adminService.getBoostAnalytics(),
    ])
    revenueSummary.value = rev || revenueSummary.value
    boostAnalytics.value = boosts || []
    recentReports.value = (boosts || []).slice(0, 4).map((b, idx) => ({
      id: b.boostLevelId || idx,
      name: `${b.boostLevelName} analytics`,
      date: new Date().toISOString().slice(0, 10),
    }))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchTransactions = async () => {
  loadingTransactions.value = true
  try {
    // Initial fetch gets ALL (or filtered backend side if needed, but user asked for frontend filtering)
    // We fetch a broad range to allow frontend filtering
    // Passing empty filter object to fetch everything
    const data = await adminService.getCreditTransactions({}) 
    rawTransactions.value = data || []
  } catch (err) {
    console.error("Failed to load transactions", err)
  } finally {
    loadingTransactions.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchTransactions()
})

// --- Filtering Logic (Frontend) ---

const filteredTransactions = computed(() => {
   return rawTransactions.value.filter(t => {
      // 1. Type Filter
      if (transFilter.value.type && t.type !== transFilter.value.type) return false
      
      // 2. Search Filter (Organizer Name)
      if (transFilter.value.search) {
         const searchLower = transFilter.value.search.toLowerCase()
         const organizer = (t.organizerName || '').toLowerCase()
         if (!organizer.includes(searchLower)) return false
      }
      
      // 3. Timeframe Filter
      if (transFilter.value.timeframe !== 'all') {
         const tDate = new Date(t.createdAt)
         const now = new Date()
         
         if (transFilter.value.timeframe === 'today') {
            if (tDate.toDateString() !== now.toDateString()) return false
         } else if (transFilter.value.timeframe === 'week') {
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7))
            if (tDate < oneWeekAgo) return false
         } else if (transFilter.value.timeframe === 'month') {
             const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
             if (tDate < oneMonthAgo) return false
         }
      }
      
      return true
   })
})

const getTypeBadgeClass = (type) => {
   switch (type) {
      case 'Purchase': return 'px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700'
      case 'PublishEvent': return 'px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'
      case 'BoostEvent': return 'px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700'
      case 'AdminAdd': return 'px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700'
      default: return 'px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700'
   }
}

const formatDate = (d) => {
   if (!d) return '-'
   return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})
}

// --- Actions ---
const generateReport = () => { alert("Report generation simulated.") }
const downloadReport = () => { alert("Report PDF downloaded.") }
const downloadReportFile = (id) => { 
  // Functional Download: Find the boost analytics item corresponding to this "report" and download as JSON
  const reportItem = boostAnalytics.value.find(b => (b.boostLevelId || b.id) === id) || boostAnalytics.value[id]
  
  if (!reportItem) {
     alert("Report data not found.")
     return
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportItem, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `${reportItem.boostLevelName || 'report'}_analytics.json`)
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

const downloadTransactionsCsv = async () => {
   try {
      const blob = await adminService.getCreditTransactions({}, true)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'credit-transactions.csv')
      document.body.appendChild(link)
      link.click()
   } catch (err) {
      alert("Failed to download CSV")
   }
}
</script>