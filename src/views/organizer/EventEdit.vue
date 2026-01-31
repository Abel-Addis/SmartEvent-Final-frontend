<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Loading State -->
        <div v-if="loading && !event" class="card text-center py-12">
            <p class="text-muted-foreground">Loading event...</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage"
            class="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {{ typeof errorMessage === 'string' ? errorMessage : (errorMessage.response?.data?.error || errorMessage.message || 'An error occurred') }}
        </div>

        <!-- Edit Form -->
        <div v-if="event" class="space-y-6">
            <!-- Header -->
            <div class="card">
                <h1 class="text-h1 mb-2">Edit Event</h1>
                <p class="text-muted-foreground">Update your event details, tickets, and pricing rules</p>
            </div>

            <!-- Event Details -->
            <div class="card space-y-6">
                <h2 class="text-h2">Event Information</h2>

                <div>
                    <label class="block text-sm font-medium mb-2">Event Title *</label>
                    <input v-model="formData.title" type="text" class="input-field w-full" :disabled="saving">
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Description</label>
                    <textarea v-model="formData.description" rows="4" class="input-field w-full" :disabled="saving" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Category *</label>
                    <select v-model="formData.categoryId" class="input-field w-full" :disabled="saving">
                        <option value="" disabled>Select a category</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Venue</label>
                        <input v-model="formData.venue" type="text" class="input-field w-full" :disabled="saving">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Location</label>
                        <input v-model="formData.location" type="text" class="input-field w-full" :disabled="saving">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Total Capacity *</label>
                    <input v-model="formData.totalCapacity" type="number" class="input-field w-full" :disabled="saving">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Event Start Date *</label>
                        <input v-model="formData.startDate" type="datetime-local" class="input-field w-full"
                            :disabled="saving">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Event End Date *</label>
                        <input v-model="formData.endDate" type="datetime-local" class="input-field w-full"
                            :disabled="saving">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Ticket Sales Start</label>
                        <input v-model="formData.ticketSalesStart" type="datetime-local" class="input-field w-full"
                            :disabled="saving">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Ticket Sales End</label>
                        <input v-model="formData.ticketSalesEnd" type="datetime-local" class="input-field w-full"
                            :disabled="saving">
                    </div>
                </div>

                <div class="space-y-4 pt-4 border-t border-border">
                    <h3 class="font-semibold">Media</h3>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Update Cover Image</label>
                        <input type="file" accept="image/*" class="input-field w-full" @change="handleCoverImageChange" :disabled="saving">
                        <p class="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Add Additional Images</label>
                        <input type="file" accept="image/*" multiple class="input-field w-full" @change="handleAdditionalImagesChange" :disabled="saving">
                    </div>
                </div>

                <div class="flex gap-3">
                    <button type="button" class="btn-primary px-4 py-2" :disabled="saving" @click="updateEvent">
                        <span v-if="saving">Saving...</span>
                        <span v-else>Save Changes</span>
                    </button>
                </div>
            </div>

            <!-- Ticket Types Management -->
            <div class="card space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-h2">Ticket Types</h2>
                    <button type="button" class="btn-outline px-3 py-2 text-sm" @click="showAddTicketModal = true">
                        + Add Ticket Type
                    </button>
                </div>

                <div v-if="event.ticketTypes.length === 0" class="text-center py-8 text-muted-foreground">
                    No ticket types yet. Add one to get started.
                </div>

                <div v-else class="space-y-3">
                    <div v-for="ticket in event.ticketTypes" :key="ticket.id"
                        class="border border-border p-4 rounded-lg">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                                <h3 class="font-semibold">{{ ticket.name }}</h3>
                                <p class="text-sm text-muted-foreground">{{ ticket.description }}</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="text-sm hover:underline" @click="editTicket(ticket)">
                                    Edit
                                </button>
                                <button class="text-sm hover:underline" @click="toggleTicketStatus(ticket)">
                                    {{ ticket.isActive ? 'Deactivate' : 'Activate' }}
                                </button>
                                <button class="text-sm text-destructive hover:underline"
                                    @click="deleteTicket(ticket.id)">
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div class="grid grid-cols-4 gap-4 text-sm">
                            <div>
                                <p class="text-muted-foreground">Price</p>
                                <p class="font-medium">${{ ticket.basePrice }}</p>
                            </div>
                            <div>
                                <p class="text-muted-foreground">Quantity</p>
                                <p class="font-medium">{{ ticket.quantity }}</p>
                            </div>
                            <div>
                                <p class="text-muted-foreground">Sold</p>
                                <p class="font-medium">{{ ticket.sold }}</p>
                            </div>
                            <div>
                                <p class="text-muted-foreground">Status</p>
                                <p
                                    :class="['font-medium', ticket.isActive ? 'text-foreground' : 'text-muted-foreground']">
                                    {{ ticket.isActive ? 'Active' : 'Inactive' }}
                                </p>
                            </div>
                        </div>

                        <!-- Pricing Rules for this ticket -->
                        <div v-if="ticket.pricingRules && ticket.pricingRules.length > 0"
                            class="mt-3 pt-3 border-t border-border">
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm font-medium">Pricing Rules</p>
                                <button class="text-xs hover:underline" @click="addPricingRule(ticket)">
                                    + Add Rule
                                </button>
                            </div>
                            <div class="space-y-2">
                                <div v-for="rule in ticket.pricingRules" :key="rule.id"
                                    class="bg-secondary p-3 rounded-lg text-sm flex justify-between items-start">
                                    <div class="flex-1">
                                        <span class="font-medium">{{ rule.ruleType }}</span>
                                        <p class="text-xs text-muted-foreground mt-1">{{ rule.description }}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="text-xs hover:underline" @click="editPricingRule(rule, ticket)">
                                            Edit
                                        </button>
                                        <button class="text-xs hover:underline" @click="toggleRuleStatus(rule)">
                                            {{ rule.isActive ? 'Deactivate' : 'Activate' }}
                                        </button>
                                        <button class="text-xs text-destructive hover:underline"
                                            @click="deletePricingRule(rule.id)">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="mt-3 pt-3 border-t border-border">
                            <button class="text-sm hover:underline" @click="addPricingRule(ticket)">
                                + Add Pricing Rule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
                <button class="btn-outline px-4 py-2" @click="goBack">
                    ← Back
                </button>
            </div>
        </div>

        <!-- Add/Edit Ticket Modal (Simple inline for now) -->
        <div v-if="showAddTicketModal || editingTicket"
            class="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
            <div class="card max-w-md w-full space-y-4">
                <h3 class="text-h3">{{ editingTicket ? 'Edit' : 'Add' }} Ticket Type</h3>

                <div>
                    <label class="block text-sm font-medium mb-2">Name *</label>
                    <input v-model="ticketForm.name" type="text" class="input-field w-full">
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Description *</label>
                    <textarea v-model="ticketForm.description" rows="2" class="input-field w-full" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Base Price *</label>
                        <input v-model="ticketForm.basePrice" type="number" step="0.01" class="input-field w-full">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Quantity *</label>
                        <input v-model="ticketForm.quantity" type="number" class="input-field w-full">
                    </div>
                </div>

                <div class="flex gap-3">
                    <button class="btn-outline flex-1 py-2" @click="closeTicketModal">
                        Cancel
                    </button>
                    <button class="btn-primary flex-1 py-2" @click="saveTicket">
                        Save
                    </button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Pricing Rule Modal -->
        <div v-if="showPricingRuleModal || editingRule"
            class="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
            <div class="card max-w-md w-full space-y-4">
                <h3 class="text-h3">{{ editingRule ? 'Edit' : 'Add' }} Pricing Rule</h3>

                <div>
                    <label class="block text-sm font-medium mb-2">Rule Type *</label>
                    <select v-model="ruleForm.ruleType" class="input-field w-full">
                        <option value="EarlyBird">Early Bird</option>
                        <option value="LastMinute">Last Minute</option>
                        <option value="DemandBased">Demand Based</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">Description</label>
                    <textarea v-model="ruleForm.description" rows="2" class="input-field w-full" />
                </div>

                <!-- Early Bird Fields -->
                <div v-if="ruleForm.ruleType === 'EarlyBird'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Start Date *</label>
                            <input v-model="ruleForm.startDate" type="datetime-local" class="input-field w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">End Date *</label>
                            <input v-model="ruleForm.endDate" type="datetime-local" class="input-field w-full">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Discount % *</label>
                        <input v-model="ruleForm.discountPercent" type="number" step="0.01" class="input-field w-full">
                    </div>
                </div>

                <!-- Last Minute Fields -->
                <div v-if="ruleForm.ruleType === 'LastMinute'" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Last N Days *</label>
                        <input v-model="ruleForm.lastNDaysBeforeEvent" type="number" class="input-field w-full">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Discount % *</label>
                        <input v-model="ruleForm.discountPercent" type="number" step="0.01" class="input-field w-full">
                    </div>
                </div>

                <!-- Demand Based Fields -->
                <div v-if="ruleForm.ruleType === 'DemandBased'" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Threshold % *</label>
                        <input v-model="ruleForm.thresholdPercentage" type="number" class="input-field w-full">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Price Increase % *</label>
                        <input v-model="ruleForm.priceIncreasePercent" type="number" step="0.01"
                            class="input-field w-full">
                    </div>
                </div>

                <div class="flex gap-3">
                    <button class="btn-outline flex-1 py-2" @click="closePricingRuleModal">
                        Cancel
                    </button>
                    <button class="btn-primary flex-1 py-2" @click="savePricingRule">
                        Save
                    </button>
                </div>
            </div>
        </div>

        <!-- Error Notification -->
        <ErrorNotification
          :show="showError"
          :title="errorTitle"
          :type="errorType"
          :message="errorMessageNotify"
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
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventService } from '@/services/eventService'
import ErrorNotification from '@/components/ErrorNotification.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'
import { useConfirmation } from '@/composables/useConfirmation'

const { 
  showError, 
  errorTitle, 
  errorMessage: errorMessageNotify, 
  errorDetail, 
  errorStatusCode, 
  errorType,
  displayError, 
  closeError 
} = useErrorNotification()

const { showConfirm, confirmTitle, confirmMessage, confirmType, confirmLoading, confirmButtonText, askConfirmation, onConfirm, onCancel } = useConfirmation()

const route = useRoute()
const router = useRouter()

const eventId = route.params.id
const event = ref(null)
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

// File inputs
const coverImageFile = ref(null)
const additionalImagesFiles = ref([])

// Form data
const formData = reactive({
    title: '',
    description: '',
    categoryId: '',
    venue: '',
    location: '',
    totalCapacity: 0,
    startDate: '',
    endDate: '',
    ticketSalesStart: '',
    ticketSalesEnd: ''
})

// Ticket modal
const showAddTicketModal = ref(false)
const editingTicket = ref(null)
const ticketForm = reactive({
    name: '',
    description: '',
    basePrice: 0,
    quantity: 0
})

// Pricing rule modal
const showPricingRuleModal = ref(false)
const editingRule = ref(null)
const currentTicketForRule = ref(null)
const ruleForm = reactive({
    ruleType: 'EarlyBird',
    description: '',
    startDate: '',
    endDate: '',
    discountPercent: 0,
    lastNDaysBeforeEvent: 0,
    thresholdPercentage: 0,
    priceIncreasePercent: 0
})

// Fetch event and categories
const loadData = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const [eventData, categoriesData] = await Promise.all([
            eventService.getEventById(eventId),
            eventService.getCategories()
        ])
        
        event.value = eventData
        categories.value = categoriesData

        // Populate form
        formData.title = eventData.title
        formData.description = eventData.description || ''
        formData.categoryId = eventData.categoryId // Ensure backend returns this, otherwise might need matching
        formData.venue = eventData.venue || ''
        formData.location = eventData.location || ''
        formData.totalCapacity = eventData.totalCapacity
        formData.startDate = formatDateTimeLocal(eventData.startDate)
        formData.endDate = formatDateTimeLocal(eventData.endDate)
        formData.ticketSalesStart = formatDateTimeLocal(eventData.ticketSalesStart)
        formData.ticketSalesEnd = formatDateTimeLocal(eventData.ticketSalesEnd)
        
    } catch (err) {
        errorMessage.value = err
        displayError(err, 'Failed to load event data')
    } finally {
        loading.value = false
    }
}

// Handle file changes
const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) coverImageFile.value = file
}

const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) additionalImagesFiles.value = files
}

// Update event
const updateEvent = async () => {
    saving.value = true
    errorMessage.value = ''

    try {
        const formDataToSend = new FormData()
        formDataToSend.append('Title', formData.title)
        formDataToSend.append('Description', formData.description)
        formDataToSend.append('CategoryId', formData.categoryId)
        formDataToSend.append('Venue', formData.venue)
        formDataToSend.append('Location', formData.location)
        formDataToSend.append('TotalCapacity', formData.totalCapacity)
        formDataToSend.append('StartDate', new Date(formData.startDate).toISOString())
        formDataToSend.append('EndDate', new Date(formData.endDate).toISOString())
        
        if (formData.ticketSalesStart) {
             formDataToSend.append('TicketSalesStart', new Date(formData.ticketSalesStart).toISOString())
        }
        if (formData.ticketSalesEnd) {
             formDataToSend.append('TicketSalesEnd', new Date(formData.ticketSalesEnd).toISOString())
        }

        // Media
        if (coverImageFile.value) {
            formDataToSend.append('CoverImage', coverImageFile.value)
        }
        
        if (additionalImagesFiles.value.length > 0) {
            additionalImagesFiles.value.forEach(file => {
                formDataToSend.append('AdditionalImages', file)
            })
        }

        await eventService.updateEvent(eventId, formDataToSend)
        
        // Reload to show updates
        const updatedEvent = await eventService.getEventById(eventId)
        event.value = updatedEvent
        // Reset file inputs
        coverImageFile.value = null
        additionalImagesFiles.value = []
        
        displayError('Event updated successfully!', 'Update Success', 'success')
    } catch (err) {
        errorMessage.value = err
        displayError(err, 'Update Failed')
    } finally {
        saving.value = false
    }
}

// Ticket management
const editTicket = (ticket) => {
    editingTicket.value = ticket
    ticketForm.name = ticket.name
    ticketForm.description = ticket.description
    ticketForm.basePrice = ticket.basePrice
    ticketForm.quantity = ticket.quantity
    showAddTicketModal.value = true
}

const closeTicketModal = () => {
    showAddTicketModal.value = false
    editingTicket.value = null
    ticketForm.name = ''
    ticketForm.description = ''
    ticketForm.basePrice = 0
    ticketForm.quantity = 0
}

const saveTicket = async () => {
    try {
        const data = {
            Name: ticketForm.name,
            Description: ticketForm.description,
            BasePrice: parseFloat(ticketForm.basePrice),
            Quantity: parseInt(ticketForm.quantity)
        }

        if (editingTicket.value) {
            await eventService.updateTicketType(editingTicket.value.id, data)
        } else {
            await eventService.addTicketType(eventId, data)
        }

        const updated = await eventService.getEventById(eventId)
        event.value = updated
        closeTicketModal()
    } catch (err) {
        displayError(err, 'Failed to save ticket')
        errorMessage.value = err
    }
}

const toggleTicketStatus = async (ticket) => {
    try {
        await eventService.setTicketTypeStatus(ticket.id, !ticket.isActive)
        const updated = await eventService.getEventById(eventId)
        event.value = updated
    } catch (err) {
        displayError(err, 'Failed to update ticket status')
    }
}

const deleteTicket = async (ticketId) => {
    const confirmed = await askConfirmation({
        title: 'Delete Ticket Type',
        message: 'Are you sure you want to delete this ticket type? This action cannot be undone.',
        type: 'danger',
        confirmText: 'Delete'
    })

    if (!confirmed) return

    try {
        await eventService.removeTicketType(ticketId)
        const updated = await eventService.getEventById(eventId)
        event.value = updated
        displayError('Ticket type deleted successfully', 'Deleted', 'success')
    } catch (err) {
        errorMessage.value = err
        displayError(err, 'Failed to delete ticket')
    }
}

// Pricing rule management
const addPricingRule = (ticket) => {
    currentTicketForRule.value = ticket
    showPricingRuleModal.value = true
}

const editPricingRule = (rule, ticket) => {
    currentTicketForRule.value = ticket
    editingRule.value = rule
    ruleForm.ruleType = rule.ruleType
    ruleForm.description = rule.description || ''
    ruleForm.discountPercent = rule.discountPercent || 0
    ruleForm.priceIncreasePercent = rule.priceIncreasePercent || 0
    ruleForm.thresholdPercentage = rule.thresholdPercentage || 0
    ruleForm.lastNDaysBeforeEvent = rule.lastNDaysBeforeEvent || 0
    ruleForm.startDate = rule.startDate ? formatDateTimeLocal(rule.startDate) : ''
    ruleForm.endDate = rule.endDate ? formatDateTimeLocal(rule.endDate) : ''
    showPricingRuleModal.value = true
}

const closePricingRuleModal = () => {
    showPricingRuleModal.value = false
    editingRule.value = null
    currentTicketForRule.value = null
    ruleForm.ruleType = 'EarlyBird'
    ruleForm.description = ''
    ruleForm.startDate = ''
    ruleForm.endDate = ''
    ruleForm.discountPercent = 0
    ruleForm.lastNDaysBeforeEvent = 0
    ruleForm.thresholdPercentage = 0
    ruleForm.priceIncreasePercent = 0
}

const savePricingRule = async () => {
    try {
        const data = {
            RuleType: ruleForm.ruleType,
            Description: ruleForm.description
        }

        if (ruleForm.ruleType === 'EarlyBird') {
            data.StartDate = new Date(ruleForm.startDate).toISOString()
            data.EndDate = new Date(ruleForm.endDate).toISOString()
            data.DiscountPercent = parseFloat(ruleForm.discountPercent)
        } else if (ruleForm.ruleType === 'LastMinute') {
            data.LastNDaysBeforeEvent = parseInt(ruleForm.lastNDaysBeforeEvent)
            data.DiscountPercent = parseFloat(ruleForm.discountPercent)
        } else if (ruleForm.ruleType === 'DemandBased') {
            data.ThresholdPercentage = parseInt(ruleForm.thresholdPercentage)
            data.PriceIncreasePercent = parseFloat(ruleForm.priceIncreasePercent)
        }

        if (editingRule.value) {
            await eventService.updatePricingRule(editingRule.value.id, data)
        } else {
            await eventService.addPricingRule(currentTicketForRule.value.id, data)
        }

        const updated = await eventService.getEventById(eventId)
        event.value = updated
        closePricingRuleModal()
    } catch (err) {
        displayError(err, 'Failed to save pricing rule')
        errorMessage.value = err
    }
}

const toggleRuleStatus = async (rule) => {
    try {
        await eventService.setPricingRuleStatus(rule.id, !rule.isActive)
        const updated = await eventService.getEventById(eventId)
        event.value = updated
    } catch (err) {
        displayError(err, 'Failed to update rule status')
    }
}

const deletePricingRule = async (ruleId) => {
    const confirmed = await askConfirmation({
        title: 'Delete Pricing Rule',
        message: 'Are you sure you want to delete this pricing rule?',
        type: 'danger',
        confirmText: 'Delete'
    })

    if (!confirmed) return

    try {
        await eventService.removePricingRule(ruleId)
        const updated = await eventService.getEventById(eventId)
        event.value = updated
        displayError('Pricing rule deleted successfully', 'Deleted', 'success')
    } catch (err) {
        errorMessage.value = err
        displayError(err, 'Failed to delete pricing rule')
    }
}

// Go back to previous page
const goBack = () => {
    router.back()
}

// Utility
const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

onMounted(() => {
    loadData()
})
</script>
