<template>
    <div class="space-y-8">
        <!-- Welcome Section -->
        <div class="card relative overflow-hidden bg-gradient-to-r from-secondary/80 via-card to-card/80">
            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(108,111,248,0.2),transparent_35%)]" />
            <div class="relative space-y-2">
                <span class="section-title">Scanner Dashboard</span>
                <h2 class="text-h2 font-bold">
                    Welcome, {{ dashboardInfo?.fullName || 'Gate Person' }}!
                </h2>
                <p class="text-muted-foreground">
                    Organizer: {{ dashboardInfo?.organizerName || 'N/A' }}
                </p>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <stat-card label="Assigned Events" :value="dashboardInfo?.assignedEvents?.length.toString() || '0'"
                icon="🎪" />
            <stat-card label="Today's Scans" :value="todayScansCount.toString()" icon="📱" />
            <stat-card label="Valid Scans" :value="validScansCount.toString()" icon="✅" />
        </div>

        <!-- QR Scanner Section -->
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-h3 font-bold">Scan Ticket</h3>
                <div class="flex gap-2">
                    <button @click="scanMode = 'manual'" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        scanMode === 'manual'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    ]">
                        ⌨️ Manual
                    </button>
                    <button @click="scanMode = 'camera'" :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        scanMode === 'camera'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    ]">
                        📷 Camera
                    </button>
                </div>
            </div>

            <div class="space-y-4">
                <!-- Manual Input Mode -->
                <div v-if="scanMode === 'manual'">
                    <label class="block text-sm font-medium mb-2">Enter QR Code</label>
                    <div class="flex gap-3">
                        <input v-model="qrCodeInput" type="text" placeholder="Scan or enter QR code..."
                            class="input-field flex-1" @keyup.enter="handleScan" :disabled="scanning" autofocus />
                        <button @click="handleScan" class="btn-primary px-6"
                            :disabled="scanning || !qrCodeInput.trim()">
                            {{ scanning ? 'Scanning...' : 'Scan' }}
                        </button>
                    </div>
                </div>

                <!-- Camera Mode -->
                <div v-else>
                    <div class="space-y-3">
                        <div v-if="!cameraActive" class="text-center py-8">
                            <button @click="startCamera" class="btn-primary px-6 py-3">
                                📷 Start Camera Scanner
                            </button>
                            <p class="text-sm text-muted-foreground mt-2">
                                Allow camera access to scan QR codes
                            </p>
                        </div>

                        <div v-show="cameraActive" class="space-y-3">
                            <div id="qr-reader" class="rounded-lg overflow-hidden border-2 border-primary"></div>
                            <button @click="stopCamera" class="btn-outline w-full py-2">
                                Stop Camera
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Scan Result -->
                <div v-if="scanResult" :class="[
                    'p-4 rounded-lg border-2',
                    scanResult.isValid
                        ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20'
                        : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                ]">
                    <div class="flex items-start gap-3">
                        <span class="text-3xl">{{ scanResult.isValid ? '✅' : '❌' }}</span>
                        <div class="flex-1">
                            <p :class="[
                                'font-bold text-lg mb-2',
                                scanResult.isValid ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                            ]">
                                {{ scanResult.message }}
                            </p>

                            <div v-if="scanResult.isValid" class="space-y-1 text-sm">
                                <p><strong>Event:</strong> {{ scanResult.eventName }}</p>
                                <p><strong>Ticket Holder:</strong> {{ scanResult.ticketHolder }}</p>
                                <p><strong>Ticket Type:</strong> {{ scanResult.ticketType }}</p>
                                <p><strong>Event Time:</strong> {{ formatDate(scanResult.eventStart) }} - {{
                                    formatDate(scanResult.eventEnd) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Assigned Events -->
        <div v-if="dashboardInfo?.hasAssignments" class="card">
            <h3 class="text-h3 font-bold mb-6">My Assigned Events</h3>

            <div v-if="dashboardInfo.assignedEvents.length === 0" class="text-center py-8 text-muted-foreground">
                No events assigned yet
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="event in dashboardInfo.assignedEvents" :key="event.eventId"
                    class="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <h4 class="font-semibold text-lg mb-2">{{ event.eventName }}</h4>
                    <div class="text-sm text-muted-foreground space-y-1">
                        <p>📅 Start: {{ formatDate(event.startDate) }}</p>
                        <p>🏁 End: {{ formatDate(event.endDate) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Scans -->
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-h3 font-bold">Recent Scans</h3>
                <button @click="loadRecentScans" class="btn-outline px-4 py-2 text-sm">
                    Refresh
                </button>
            </div>

            <div v-if="loadingScans" class="text-center py-8 text-muted-foreground">
                Loading scans...
            </div>

            <div v-else-if="recentScans.length === 0" class="text-center py-8 text-muted-foreground">
                No scans yet
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full">
                    <thead class="border-b border-border">
                        <tr class="text-left">
                            <th class="pb-3 font-semibold">Time</th>
                            <th class="pb-3 font-semibold">Event</th>
                            <th class="pb-3 font-semibold">Ticket Holder</th>
                            <th class="pb-3 font-semibold">Ticket Type</th>
                            <th class="pb-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="scan in recentScans" :key="scan.id" class="border-b border-border last:border-0">
                            <td class="py-3 text-sm">{{ formatDateTime(scan.scannedAt) }}</td>
                            <td class="py-3 text-sm">{{ scan.eventName }}</td>
                            <td class="py-3 text-sm">
                                <div>{{ scan.ticketHolderName }}</div>
                                <div class="text-xs text-muted-foreground">{{ scan.ticketHolderEmail }}</div>
                            </td>
                            <td class="py-3 text-sm">{{ scan.ticketTypeName }}</td>
                            <td class="py-3">
                                <span :class="[
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    scan.isValid
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                                ]">
                                    {{ scan.isValid ? 'Valid' : scan.reason }}
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
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { gatePersonService } from '@/services/gatePersonService'
import StatCard from '@/components/StatCard.vue'
import { Html5Qrcode } from 'html5-qrcode'

const dashboardInfo = ref(null)
const recentScans = ref([])
const loadingScans = ref(false)
const qrCodeInput = ref('')
const scanning = ref(false)
const scanResult = ref(null)
const scanMode = ref('manual') // 'manual' or 'camera'
const cameraActive = ref(false)
let html5QrCode = null

const todayScansCount = computed(() => {
    const today = new Date().toDateString()
    return recentScans.value.filter(scan =>
        new Date(scan.scannedAt).toDateString() === today
    ).length
})

const validScansCount = computed(() => {
    return recentScans.value.filter(scan => scan.isValid).length
})

onMounted(async () => {
    await Promise.all([
        loadDashboardInfo(),
        loadRecentScans()
    ])
})

onUnmounted(() => {
    stopCamera()
})

const loadDashboardInfo = async () => {
    try {
        const data = await gatePersonService.getDashboardInfo()
        dashboardInfo.value = data
    } catch (error) {
        console.error('Failed to load dashboard info:', error)
    }
}

const loadRecentScans = async () => {
    loadingScans.value = true
    try {
        const data = await gatePersonService.getRecentScans()
        recentScans.value = data || []
    } catch (error) {
        console.error('Failed to load recent scans:', error)
        recentScans.value = []
    } finally {
        loadingScans.value = false
    }
}

const startCamera = async () => {
    try {
        // Set camera active first to show the DOM element
        cameraActive.value = true

        // Wait for DOM to update
        await nextTick()

        html5QrCode = new Html5Qrcode("qr-reader")

        await html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
                // QR code successfully scanned
                qrCodeInput.value = decodedText
                handleScan()
                // Optionally stop camera after successful scan
                // stopCamera()
            },
            (errorMessage) => {
                // Scan error (can be ignored, happens frequently)
            }
        )
    } catch (error) {
        console.error('Failed to start camera:', error)
        cameraActive.value = false
        alert('Failed to access camera. Please ensure camera permissions are granted.')
    }
}

const stopCamera = async () => {
    if (html5QrCode && cameraActive.value) {
        try {
            await html5QrCode.stop()
            html5QrCode = null
            cameraActive.value = false
        } catch (error) {
            console.error('Failed to stop camera:', error)
        }
    }
}

const handleScan = async () => {
    if (!qrCodeInput.value.trim()) return

    scanning.value = true
    scanResult.value = null

    try {
        const result = await gatePersonService.scanTicket({
            qrCode: qrCodeInput.value.trim()
        })

        scanResult.value = result

        // Refresh recent scans after successful scan
        await loadRecentScans()

        // Clear input after scan
        qrCodeInput.value = ''

        // Auto-clear result after 10 seconds
        setTimeout(() => {
            scanResult.value = null
        }, 10000)
    } catch (error) {
        scanResult.value = {
            isValid: false,
            message: error.response?.data?.message || 'Scan failed. Please try again.'
        }
    } finally {
        scanning.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>
