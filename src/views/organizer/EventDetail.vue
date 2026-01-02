<template>
    <div class="max-w-6xl mx-auto space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="card text-center py-12">
            <p class="text-muted-foreground">Loading event details...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="card bg-destructive/10 border-destructive/20 text-destructive p-4">
            {{ error }}
        </div>

        <!-- Event Details -->
        <div v-if="!loading && event" class="space-y-6">
            <!-- Header -->
            <div class="card">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h1 class="text-h1">{{ event.title }}</h1>
                            <span :class="['px-3 py-1 rounded-lg text-sm font-medium', getStatusClass(event.status)]">
                                {{ event.status }}
                            </span>
                        </div>
                        <p class="text-muted-foreground">{{ event.categoryName }}</p>
                    </div>
                    <div class="flex gap-2">
                        <router-link :to="`/organizer/events/${eventId}/edit`" class="btn-primary px-4 py-2">
                            Edit Event
                        </router-link>
                        <button v-if="event.status === 'Draft'" class="btn-outline px-4 py-2" @click="openPublishModal">
                            Publish
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-4 border-b border-border mb-6">
                <button 
                  @click="activeTab = 'overview'"
                  :class="['px-4 py-2 border-b-2 transition-colors', activeTab === 'overview' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground']"
                >
                  Overview
                </button>
                <button 
                  @click="activeTab = 'feedback'"
                  :class="['px-4 py-2 border-b-2 transition-colors', activeTab === 'feedback' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground']"
                >
                  Feedback
                </button>
                <button 
                  @click="activeTab = 'notifications'"
                  :class="['px-4 py-2 border-b-2 transition-colors', activeTab === 'notifications' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground']"
                >
                  Notifications
                </button>
                <button 
                  @click="activeTab = 'checkin'"
                  :class="['px-4 py-2 border-b-2 transition-colors', activeTab === 'checkin' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground']"
                >
                  Check-in
                </button>
            </div>

            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="space-y-6">
                <!-- Event Image -->
                <div v-if="event.media?.coverImageUrl" class="card p-0 overflow-hidden">
                    <img :src="event.media.coverImageUrl" :alt="event.title" class="w-full h-96 object-cover">
                </div>
    
                <!-- Event Information -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Basic Info -->
                    <div class="card space-y-4">
                        <h2 class="text-h2">Event Information</h2>
    
                        <div>
                            <p class="text-sm text-muted-foreground">Description</p>
                            <p class="mt-1">{{ event.description || 'No description provided' }}</p>
                        </div>
    
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-muted-foreground">Venue</p>
                                <p class="mt-1 font-medium">{{ event.venue || 'TBD' }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Location</p>
                                <p class="mt-1 font-medium">{{ event.location || 'TBD' }}</p>
                            </div>
                        </div>
    
                        <div>
                            <p class="text-sm text-muted-foreground">Total Capacity</p>
                            <p class="mt-1 font-medium">{{ event.totalCapacity }} attendees</p>
                        </div>
                    </div>
    
                    <!-- Dates -->
                    <div class="card space-y-4">
                        <h2 class="text-h2">Schedule</h2>
    
                        <div>
                            <p class="text-sm text-muted-foreground">Event Dates</p>
                            <p class="mt-1 font-medium">{{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}
                            </p>
                        </div>
    
                        <div v-if="event.ticketSalesStart">
                            <p class="text-sm text-muted-foreground">Ticket Sales Start</p>
                            <p class="mt-1 font-medium">{{ formatDate(event.ticketSalesStart) }}</p>
                        </div>
    
                        <div v-if="event.ticketSalesEnd">
                            <p class="text-sm text-muted-foreground">Ticket Sales End</p>
                            <p class="mt-1 font-medium">{{ formatDate(event.ticketSalesEnd) }}</p>
                        </div>
                    </div>
                </div>
    
                <!-- TicketTypes -->
                <div class="card">
                    <h2 class="text-h2 mb-4">Ticket Types</h2>
    
                    <div v-if="event.ticketTypes.length === 0" class="text-center py-8 text-muted-foreground">
                        No ticket types configured yet
                    </div>
    
                    <div v-else class="space-y-3">
                        <div v-for="ticket in event.ticketTypes" :key="ticket.id"
                            class="border border-border p-4 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <h3 class="font-semibold">{{ ticket.name }}</h3>
                                        <span
                                            :class="['px-2 py-0.5 rounded text-xs', ticket.isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground']">
                                            {{ ticket.isActive ? 'Active' : 'Inactive' }}
                                        </span>
                                    </div>
                                    <p class="text-sm text-muted-foreground mt-1">{{ ticket.description }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-lg font-bold">${{ ticket.basePrice }}</p>
                                    <p class="text-xs text-muted-foreground">Base Price</p>
                                </div>
                            </div>
    
                            <div class="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border text-sm">
                                <div>
                                    <p class="text-muted-foreground">Quantity</p>
                                    <p class="font-medium">{{ ticket.quantity }}</p>
                                </div>
                                <div>
                                    <p class="text-muted-foreground">Sold</p>
                                    <p class="font-medium">{{ ticket.sold }}</p>
                                </div>
                                <div>
                                    <p class="text-muted-foreground">Available</p>
                                    <p class="font-medium">{{ ticket.quantity - ticket.sold }}</p>
                                </div>
                            </div>
    
                            <!-- Pricing Rules -->
                            <div v-if="ticket.pricingRules && ticket.pricingRules.length > 0"
                                class="mt-3 pt-3 border-t border-border">
                                <p class="text-sm font-medium mb-2">Pricing Rules</p>
                                <div class="space-y-2">
                                    <div v-for="rule in ticket.pricingRules" :key="rule.id"
                                        class="bg-secondary p-3 rounded-lg text-sm">
                                        <div class="flex justify-between items-start">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-2">
                                                    <span class="font-medium">{{ rule.ruleType }}</span>
                                                    <span
                                                        :class="['px-2 py-0.5 rounded text-xs', rule.isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground']">
                                                        {{ rule.isActive ? 'Active' : 'Inactive' }}
                                                    </span>
                                                </div>
                                                <p class="text-muted-foreground mt-1">{{ rule.description }}</p>
                                            </div>
                                        </div>
    
                                        <div class="mt-2 text-xs text-muted-foreground">
                                            <span v-if="rule.discountPercent">Discount: {{ rule.discountPercent }}%</span>
                                            <span v-if="rule.priceIncreasePercent">Price Increase: {{
                                                rule.priceIncreasePercent }}%</span>
                                            <span v-if="rule.thresholdPercentage"> • Threshold: {{ rule.thresholdPercentage
                                                }}%</span>
                                            <span v-if="rule.lastNDaysBeforeEvent"> • Last {{ rule.lastNDaysBeforeEvent }}
                                                days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notifications Tab -->
            <div v-if="activeTab === 'notifications'" class="space-y-6">
                <div class="card max-w-2xl mx-auto">
                    <h2 class="text-h2 mb-2">📢 Send Announcement</h2>
                    <p class="text-muted-foreground mb-6">Send a notification to all confirmed attendees of this event.</p>
                    
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="font-medium">Title</label>
                            <input 
                              v-model="notifForm.title"
                              type="text" 
                              class="input-field" 
                              placeholder="e.g. Important Update: Venue Change"
                            />
                        </div>

                        <div class="space-y-2">
                            <label class="font-medium">Message</label>
                            <textarea 
                              v-model="notifForm.message"
                              rows="5"
                              class="input-field"
                              placeholder="Type your message here..."
                            ></textarea>
                        </div>
                        
                        <div class="flex flex-col gap-2">
                            <button 
                              @click="sendNotification" 
                              :disabled="sendingNotif || !isNotifValid"
                              class="btn-primary w-full py-3"
                            >
                                {{ sendingNotif ? 'Sending...' : 'Send Notification' }}
                            </button>
                            
                            <p v-if="notifSuccess" class="text-success text-center text-sm font-medium animate-pulse">
                                {{ notifSuccess }}
                            </p>
                            <p v-if="notifError" class="text-destructive text-center text-sm">
                                {{ notifError }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Feedback Tab -->
            <div v-if="activeTab === 'feedback'" class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div class="card flex items-center gap-4">
                      <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">⭐</div>
                      <div>
                         <p class="text-sm text-muted-foreground">Average</p>
                         <p class="text-2xl font-bold">{{ feedbackSummary?.averageRating.toFixed(1) || '0.0' }}</p>
                      </div>
                    </div>
                     <div class="card flex items-center gap-4">
                      <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">💬</div>
                      <div>
                         <p class="text-sm text-muted-foreground">Total</p>
                         <p class="text-2xl font-bold">{{ feedbackSummary?.totalFeedbacks || 0 }}</p>
                      </div>
                    </div>
                </div>

                <!-- Feedback List -->
                <div class="card">
                    <h3 class="text-h3 font-bold mb-6">Reviews</h3>
                    <div v-if="loadingFeedback" class="text-center py-8">Loading...</div>
                    <div v-else-if="feedbacks.length === 0" class="text-center py-8 text-muted-foreground">No feedback yet.</div>
                    <div v-else class="space-y-6">
                         <div v-for="fb in feedbacks" :key="fb.feedbackId" class="border-b border-border last:border-0 pb-6 last:pb-0">
                           <div class="flex justify-between items-start mb-2">
                             <div class="flex items-center gap-3">
                               <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                 {{ fb.userName.charAt(0) }}
                               </div>
                               <div>
                                 <p class="font-semibold">{{ fb.userName }}</p>
                                 <p class="text-xs text-muted-foreground">{{ formatDate(fb.createdAt) }}</p>
                               </div>
                             </div>
                           </div>
                           <div class="ml-13 pl-13">
                              <div class="flex text-amber-500 text-sm mb-2">
                                 <span v-for="n in 5" :key="n">{{ n <= fb.rating ? '★' : '☆' }}</span>
                              </div>
                              <p class="text-foreground/90 whitespace-pre-wrap">{{ fb.comment }}</p>
                           </div>
                         </div>
                    </div>
                </div>
            </div>

            <!-- Check-in Tab -->
            <div v-if="activeTab === 'checkin'" class="space-y-6">
                <!-- Check-in Summary -->
                <div v-if="scanSummary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="card p-4">
                        <p class="text-sm text-muted-foreground">Total Scans</p>
                        <p class="text-2xl font-bold">{{ scanSummary.totalScans }}</p>
                    </div>
                    <div class="card p-4">
                        <p class="text-sm text-muted-foreground">Valid Scans</p>
                        <p class="text-2xl font-bold text-success">{{ scanSummary.validScans }}</p>
                    </div>
                     <div class="card p-4">
                        <p class="text-sm text-muted-foreground">Invalid Scans</p>
                        <p class="text-2xl font-bold text-destructive">{{ scanSummary.invalidScans }}</p>
                    </div>
                    <div class="card p-4">
                        <p class="text-sm text-muted-foreground">Unique Attendees</p>
                        <p class="text-2xl font-bold text-primary">{{ scanSummary.uniqueTicketHolders }}</p>
                    </div>
                </div>

                <!-- Gate Person Breakdown -->
                 <div v-if="scanSummary?.gatePersons?.length > 0" class="card">
                     <h3 class="text-h3 font-bold mb-4">Scanner Performance</h3>
                     <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                             <thead class="bg-muted/50 border-b border-border">
                                <tr>
                                    <th class="text-left py-2 px-3">Scanner</th>
                                    <th class="text-right py-2 px-3">Total</th>
                                    <th class="text-right py-2 px-3">Valid</th>
                                    <th class="text-right py-2 px-3">Invalid</th>
                                </tr>
                             </thead>
                             <tbody>
                                <tr v-for="gp in scanSummary.gatePersons" :key="gp.gatePersonId" class="border-b border-border last:border-0">
                                    <td class="py-2 px-3 font-medium">{{ gp.gatePersonName }}</td>
                                    <td class="py-2 px-3 text-right">{{ gp.totalScans }}</td>
                                    <td class="py-2 px-3 text-right text-success">{{ gp.validScans }}</td>
                                    <td class="py-2 px-3 text-right text-destructive">{{ gp.invalidScans }}</td>
                                </tr>
                             </tbody>
                        </table>
                     </div>
                 </div>

                <!-- Scan Logs -->
                <div class="card">
                    <div class="flex justify-between items-center mb-6">
                         <h3 class="text-h3 font-bold">Recent Activities</h3>
                         <button @click="fetchScanData" :disabled="loadingScans" class="text-sm text-primary hover:underline">
                            Refresh
                         </button>
                    </div>

                    <div v-if="loadingScans && !scanSummary" class="text-center py-10">
                        <p class="text-muted-foreground">Loading scan data...</p>
                    </div>
                    
                    <div v-else-if="scanLogs.length === 0" class="text-center py-10 text-muted-foreground">
                        No scan activities recorded yet.
                    </div>
                    
                    <div v-else class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-muted/50 border-b border-border">
                                <tr>
                                    <th class="text-left px-4 py-3 text-sm font-semibold">Time</th>
                                    <th class="text-left px-4 py-3 text-sm font-semibold">Attendee</th>
                                    <th class="text-left px-4 py-3 text-sm font-semibold">Ticket Type</th>
                                    <th class="text-left px-4 py-3 text-sm font-semibold">Status</th>
                                    <th class="text-left px-4 py-3 text-sm font-semibold">Scanner</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="log in scanLogs" :key="log.id" class="border-b border-border hover:bg-muted/30">
                                    <td class="px-4 py-3 text-sm">
                                        {{ new Date(log.scannedAt).toLocaleString() }}
                                    </td>
                                    <td class="px-4 py-3 text-sm">
                                        <div class="font-medium">{{ log.ticketHolderName }}</div>
                                        <div class="text-xs text-muted-foreground">{{ log.ticketHolderEmail }}</div>
                                    </td>
                                     <td class="px-4 py-3 text-sm text-muted-foreground">
                                        {{ log.ticketTypeName }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <span :class="['px-2 py-0.5 rounded text-xs font-medium', log.isValid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive']">
                                            {{ log.isValid ? 'Valid' : 'Invalid' }}
                                        </span>
                                        <div v-if="!log.isValid && log.reason" class="text-xs text-destructive mt-0.5">
                                            {{ log.reason }}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-muted-foreground">
                                        {{ log.scannerName || 'Unknown' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Pagination could go here -->
                </div>
            </div>

            <!-- Back Button -->
            <div class="flex gap-3 mt-6">
                <button class="btn-outline px-4 py-2" @click="goBack">
                    ← Back
                </button>
            </div>
        </div>

        <!-- Publish Confirmation Modal -->
        <div v-if="showPublishModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="closePublishModal">
            <div class="card max-w-md w-full">
                <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-h3">Publish Event</h3>
                        <button class="text-muted-foreground hover:text-foreground" @click="closePublishModal">✕</button>
                    </div>

                    <p class="text-sm text-muted-foreground">
                        Are you sure you want to publish "{{ event?.title }}"? This will make it visible to attendees.
                    </p>

                    <!-- Telegram Publishing Option -->
                    <div class="border border-border rounded-lg p-4 bg-muted/20">
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input v-model="postToTelegram" type="checkbox"
                                class="mt-1 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0">
                            <div>
                                <span class="font-medium text-sm">Post to Telegram Channel</span>
                                <p class="text-xs text-muted-foreground mt-1">
                                    Share this event on our Telegram channel when publishing. This will help reach a wider audience.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button type="button" class="btn-outline flex-1 py-2" @click="closePublishModal">
                            Cancel
                        </button>
                        <button type="button" class="btn-primary flex-1 py-2" :disabled="publishing"
                            @click="confirmPublish">
                            <span v-if="publishing">Publishing...</span>
                            <span v-else>Publish Event</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventService } from '@/services/eventService'
import { feedbackService } from '@/services/feedbackService'
import { notificationService } from '@/services/notificationService'
import { ticketScanService } from '@/services/ticketScanService'

const route = useRoute()
const router = useRouter()

const eventId = route.params.id
const event = ref(null)
const loading = ref(false)
const error = ref(null)

const activeTab = ref('overview')
const feedbacks = ref([])
const feedbackSummary = ref(null)
const loadingFeedback = ref(false)

// Notification State
const notifForm = ref({ title: '', message: '' })
const sendingNotif = ref(false)
const notifSuccess = ref('')
const notifError = ref('')
const isNotifValid = computed(() => notifForm.value.title.trim() && notifForm.value.message.trim())

// Check-in State
const scanSummary = ref(null)
const scanLogs = ref([])
const loadingScans = ref(false)

// Publish Modal State
const showPublishModal = ref(false)
const postToTelegram = ref(false)
const publishing = ref(false)

// Fetch event details
const fetchEventDetails = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await eventService.getEventById(eventId)
        event.value = response
    } catch (err) {
        console.error('Failed to fetch event:', err)
        error.value = 'Failed to load event details. Please try again.'
    } finally {
        loading.value = false
    }
}

const fetchFeedbackData = async () => {
    loadingFeedback.value = true
    try {
        const [list, summary] = await Promise.all([
            feedbackService.getFeedbacksForEvent(eventId),
            feedbackService.getEventFeedbackSummary(eventId)
        ])
        feedbacks.value = list || []
        feedbackSummary.value = summary
    } catch (err) {
        console.error("Failed to load feedback", err)
    } finally {
        loadingFeedback.value = false
    }
}

// Watch tab for feedback/scans load
watch(activeTab, (newTab) => {
    if (newTab === 'feedback' && feedbacks.value.length === 0) {
        fetchFeedbackData()
    } else if (newTab === 'checkin' && !scanSummary.value) {
        fetchScanData()
    }
})

const fetchScanData = async () => {
    loadingScans.value = true
    try {
        const [summary, logs] = await Promise.all([
            ticketScanService.getScanSummary(eventId),
            ticketScanService.getEventScanLogs(eventId, { pageSize: 50, pageNumber: 1 })
        ])
        scanSummary.value = summary
        scanLogs.value = logs?.items || logs || [] // Handle potential different pagination structure
    } catch (err) {
        console.error("Failed to load scan data", err)
    } finally {
        loadingScans.value = false
    }
}

// Send Notification
const sendNotification = async () => {
    if (!isNotifValid.value) return
    
    sendingNotif.value = true
    notifSuccess.value = ''
    notifError.value = ''
    
    try {
        await notificationService.sendEventNotification({
            eventId,
            title: notifForm.value.title,
            message: notifForm.value.message
        })
        notifSuccess.value = 'Notification sent successfully! 🚀'
        notifForm.value = { title: '', message: '' }
    } catch (err) {
        console.error("Failed to send notification", err)
        notifError.value = 'Failed to send notification. Please try again.'
    } finally {
        sendingNotif.value = false
    }
}

// Open publish modal
const openPublishModal = () => {
    postToTelegram.value = false
    showPublishModal.value = true
}

// Close publish modal
const closePublishModal = () => {
    showPublishModal.value = false
    postToTelegram.value = false
}

// Confirm publish with optional Telegram posting
const confirmPublish = async () => {
    publishing.value = true
    error.value = null

    try {
        // First publish the event
        await eventService.publishEvent(eventId)

        // If Telegram checkbox is checked, post to Telegram
        if (postToTelegram.value) {
            try {
                await eventService.postEventToTelegram(eventId)
            } catch (telegramErr) {
                console.error('Failed to post to Telegram:', telegramErr)
                // Don't block the flow - event is already published
            }
        }

        // Refresh event details and close modal
        await fetchEventDetails()
        closePublishModal()
    } catch (err) {
        console.error('Failed to publish event:', err)
        error.value = 'Failed to publish event. Please try again.'
    } finally {
        publishing.value = false
    }
}

// Go back to previous page
const goBack = () => {
    router.back()
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Get status class
const getStatusClass = (status) => {
    if (status === 'Published') {
        return 'bg-foreground text-background'
    } else if (status === 'Draft') {
        return 'bg-secondary text-foreground border border-border'
    }
    return 'bg-muted text-muted-foreground'
}

// Fetch event on mount
onMounted(() => {
    fetchEventDetails()
    
    // Check for tab query param
    if (route.query.tab === 'feedback') {
       activeTab.value = 'feedback'
    }
})
</script>
