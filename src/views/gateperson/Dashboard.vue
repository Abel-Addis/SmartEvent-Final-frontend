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

            <div v-else>
                <!-- Desktop Table -->
                <div class="hidden sm:block overflow-x-auto">
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
                            <tr v-for="scan in recentScans" :key="scan.id" class="border-b border-border last:border-0 bg-card/50 hover:bg-muted/30 transition-colors">
                                <td class="py-3 text-sm">{{ formatDateTime(scan.scannedAt) }}</td>
                                <td class="py-3 text-sm font-medium">{{ scan.eventName }}</td>
                                <td class="py-3 text-sm">
                                    <div class="font-medium">{{ scan.ticketHolderName }}</div>
                                    <div class="text-xs text-muted-foreground">{{ scan.ticketHolderEmail }}</div>
                                </td>
                                <td class="py-3 text-sm">{{ scan.ticketTypeName }}</td>
                                <td class="py-3">
                                    <span :class="[
                                        'px-2 py-1 rounded-full text-xs font-medium border',
                                        scan.isValid
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                    ]">
                                        {{ scan.isValid ? 'Valid' : (scan.reason || 'Invalid') }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Card Layout -->
                <div class="sm:hidden space-y-4">
                    <div v-for="scan in recentScans" :key="scan.id" class="p-4 rounded-xl border border-border bg-card shadow-sm">
                        <!-- Header with Status -->
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <div class="text-xs text-muted-foreground mb-1">{{ formatDateTime(scan.scannedAt) }}</div>
                                <h4 class="font-semibold text-sm line-clamp-1">{{ scan.eventName }}</h4>
                            </div>
                            <span :class="[
                                'px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2',
                                scan.isValid
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                            ]">
                                {{ scan.isValid ? 'Valid' : 'Invalid' }}
                            </span>
                        </div>
                        
                        <!-- Details -->
                        <div class="space-y-3 pt-3 border-t border-border/50">
                           <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ticket Holder</span>
                                    <div class="font-medium text-sm mt-0.5">{{ scan.ticketHolderName }}</div>
                                </div>
                                <div>
                                     <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Type</span>
                                    <div class="text-sm mt-0.5">{{ scan.ticketTypeName }}</div>
                                </div>
                           </div>

                             <div v-if="!scan.isValid && scan.reason" class="text-xs p-2 rounded bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30">
                                ⚠️ {{ scan.reason }}
                            </div>
                        </div>
                    </div>
                </div>
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

    <!-- Confirmation Modal -->
    <ConfirmationModal
        :show="showConfirm"
        :title="confirmTitle"
        :message="confirmMessage"
        :type="confirmType"
        :confirm-text="confirmButtonText"
        :loading="confirmLoading"
        @confirm="onConfirm"
        @cancel="onCancel"
    />
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { gatePersonService } from '@/services/gatePersonService'
import StatCard from '@/components/StatCard.vue'
import ErrorNotification from '@/components/ErrorNotification.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'
import { useConfirmation } from '@/composables/useConfirmation'
import { Html5Qrcode } from 'html5-qrcode'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()
const { showConfirm, confirmTitle, confirmMessage, confirmType, confirmLoading, confirmButtonText, askConfirmation, onConfirm, onCancel } = useConfirmation()

const dashboardInfo = ref(null)
const recentScans = ref([])
const loadingScans = ref(false)
const qrCodeInput = ref('')
const scanning = ref(false)
const scanResult = ref(null)
const scanMode = ref('manual') // 'manual' or 'camera'
const cameraActive = ref(false)
const processingScan = ref(false)
const lastScanTime = ref(0)
const lastScannedCode = ref('')
const SCAN_COOLDOWN = 2000
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
        displayError(error, 'Failed to load dashboard info')
    }
}

const loadRecentScans = async () => {
    loadingScans.value = true
    try {
        const data = await gatePersonService.getRecentScans()
        recentScans.value = data || []
    } catch (error) {
        displayError(error, 'Failed to load recent scans')
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
                // 1. Check if it's the same code as before (ignore duplicates)
                if (decodedText === lastScannedCode.value) return

                // 2. Prevent rapid scans (cooldown)
                const now = Date.now()
                if (processingScan.value || (now - lastScanTime.value < SCAN_COOLDOWN)) {
                    return
                }

                // QR code successfully scanned
                lastScannedCode.value = decodedText
                qrCodeInput.value = decodedText
                handleScan()
            },
            (errorMessage) => {
                // Scan error (can be ignored, happens frequently)
            }
        )
    } catch (error) {
        cameraActive.value = false
        displayError('Failed to access camera. Please ensure camera permissions are granted.', 'Camera Error')
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

    // Prevent concurrent scans or rapid fire
    if (processingScan.value) return
    
    // Check cooldown for manual triggers too
    const now = Date.now()
    if (now - lastScanTime.value < SCAN_COOLDOWN) return

    scanning.value = true
    processingScan.value = true
    scanResult.value = null

    try {
        const result = await gatePersonService.scanTicket({
            qrCode: qrCodeInput.value.trim()
        })

        scanResult.value = result
        lastScanTime.value = Date.now() // Update cooldown timestamp
        
        if (result.isValid) {
            displayError(result.message || 'Ticket scan successful!', 'Success', 'success')
        } else {
            displayError(result.message || 'Ticket is invalid.', 'Invalid Ticket', 'error')
        }

        // Refresh recent scans after successful scan
        await loadRecentScans()

        // Clear input after scan
        qrCodeInput.value = ''

        // Auto-clear result after 10 seconds
        setTimeout(() => {
            scanResult.value = null
        }, 10000)
    } catch (error) {
        lastScanTime.value = Date.now() // Update cooldown even on error
        lastScannedCode.value = '' // Allow retrying the same code if there was an error
        scanResult.value = {
            isValid: false,
            message: error.response?.data?.message || 'Scan failed. Please try again.'
        }
        displayError(error, 'Scan Failed')
    } finally {
        scanning.value = false
        // Short delay before releasing lock to ensure UI updates finish
        setTimeout(() => {
            processingScan.value = false
        }, 500)
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
