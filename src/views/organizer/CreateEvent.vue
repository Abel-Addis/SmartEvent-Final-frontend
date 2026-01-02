<template>
  <div class="max-w-4xl mx-auto">
    <!-- Error Message -->
    <div v-if="errorMessage"
      class="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
      {{ errorMessage }}
    </div>

    <!-- Progress Indicator -->
    <div class="mb-8">
      <div class="flex gap-4 mb-6">
        <div v-for="(step, idx) in steps" :key="step"
          :class="['flex-1 text-center', idx < currentStep ? 'text-foreground' : 'text-muted-foreground']">
          <div
            :class="['w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold', idx < currentStep ? 'bg-foreground text-background' : 'bg-muted']">
            {{ idx + 1 }}
          </div>
          <p class="text-sm font-medium">
            {{ step }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <div v-for="step in steps.length" :key="step"
          :class="['flex-1 h-1 rounded-full', step <= currentStep ? 'bg-foreground' : 'bg-border']" />
      </div>
    </div>

    <!-- Step 1: Event Details -->
    <div v-show="currentStep === 1" class="card space-y-6">
      <h2 class="text-h2">Event Details</h2>

      <div>
        <label class="block text-sm font-medium mb-2">Event Title *</label>
        <input v-model="title" type="text" placeholder="e.g., Summer Music Festival" class="input-field w-full"
          :class="{ 'border-destructive': errors.title }" :disabled="loading">
        <p v-if="errors.title" class="text-xs text-red-600 mt-1">{{ errors.title }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Description</label>
        <textarea v-model="description" rows="4" placeholder="Describe your event..." class="input-field w-full"
          :class="{ 'border-destructive': errors.description }" :disabled="loading" />
        <p v-if="errors.description" class="text-xs text-red-600 mt-1">{{ errors.description }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Category *</label>
          <select v-model="categoryId" class="input-field w-full" :class="{ 'border-destructive': errors.categoryId }"
            :disabled="loading">
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <p v-if="errors.categoryId" class="text-xs text-red-600 mt-1">{{ errors.categoryId }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Total Capacity *</label>
          <input v-model="totalCapacity" type="number" placeholder="Max attendees" class="input-field w-full"
            :class="{ 'border-destructive': errors.totalCapacity }" :disabled="loading">
          <p v-if="errors.totalCapacity" class="text-xs text-red-600 mt-1">{{ errors.totalCapacity }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Venue</label>
          <input v-model="venue" type="text" placeholder="e.g., Millennium Hall" class="input-field w-full"
            :disabled="loading">
          <p v-if="errors.venue" class="text-xs text-red-600 mt-1">{{ errors.venue }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Location (Map)</label>
          <MapLocationPicker v-model="location" />
          <p v-if="errors.location" class="text-xs text-red-600 mt-1">{{ errors.location }}</p>
          <p class="text-xs text-muted-foreground mt-1">
            Click on the map to select the event location. Coordinates will be saved automatically.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Ticket Sales Start *</label>
          <input v-model="ticketSalesStart" type="datetime-local" class="input-field w-full" :disabled="loading">
          <p v-if="errors.ticketSalesStart" class="text-xs text-red-600 mt-1">{{ errors.ticketSalesStart }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Ticket Sales End</label>
          <input v-model="ticketSalesEnd" type="datetime-local" class="input-field w-full" :disabled="loading">
          <p v-if="errors.ticketSalesEnd" class="text-xs text-red-600 mt-1">{{ errors.ticketSalesEnd }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Event Start Date *</label>
          <input v-model="startDate" type="datetime-local" class="input-field w-full" :disabled="loading">
          <p v-if="errors.startDate" class="text-xs text-red-600 mt-1">{{ errors.startDate }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Event End Date *</label>
          <input v-model="endDate" type="datetime-local" class="input-field w-full" :disabled="loading">
          <p v-if="errors.endDate" class="text-xs text-red-600 mt-1">{{ errors.endDate }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Cover Image *</label>
        <input type="file" accept="image/*" class="input-field w-full" :disabled="loading"
          @change="handleCoverImageChange">
        <img v-if="coverImagePreview" :src="coverImagePreview" class="mt-3 h-40 w-full rounded-lg object-cover"
          alt="Cover preview">
        <p v-if="errors.coverImage" class="text-xs text-red-600 mt-1">{{ errors.coverImage }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Additional Images (Optional)</label>
        <input type="file" accept="image/*" multiple class="input-field w-full" :disabled="loading"
          @change="handleAdditionalImagesChange">
        <div v-if="additionalImagesPreview.length > 0" class="mt-3 grid grid-cols-4 gap-2">
          <img v-for="(preview, idx) in additionalImagesPreview" :key="idx" :src="preview"
            class="h-20 w-full rounded-lg object-cover" alt="Additional image">
        </div>
      </div>

      <div class="flex gap-3">
        <button type="button" class="btn-primary flex-1 py-3" :disabled="loading" @click="createDraftEvent">
          <span v-if="loading">Creating Draft...</span>
          <span v-else>Next: Add Tickets</span>
        </button>
      </div>
    </div>

    <!-- Step 2: Ticket Types -->
    <div v-show="currentStep === 2" class="card space-y-6">
      <h2 class="text-h2">Ticket Types</h2>

      <div v-for="(ticket, idx) in tickets" :key="idx" class="border border-border p-4 rounded-lg space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Ticket #{{ idx + 1 }}</h3>
          <button v-if="tickets.length > 1" type="button" class="text-destructive text-sm hover:underline"
            @click="removeTicket(idx)">
            Remove
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Ticket Source</label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button"
              :class="['p-3 rounded-lg font-medium transition-all border', ticket.isDefault ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-secondary']"
              @click="ticket.isDefault = true">
              Default Ticket
            </button>
            <button type="button"
              :class="['p-3 rounded-lg font-medium transition-all border', !ticket.isDefault ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-secondary']"
              @click="switchToCustomTicket(idx)">
              Custom Ticket
            </button>
          </div>
        </div>

        <div v-if="ticket.isDefault">
          <label class="block text-sm font-medium mb-2">Select Default Ticket</label>
          <select v-model="ticket.defaultTicketId" class="input-field w-full" @change="applyDefaultTicket(idx)">
            <option value="">Choose a ticket type</option>
            <option v-for="dt in defaultTicketTypes" :key="dt.id" :value="dt.id">
              {{ dt.name }} - {{ dt.description }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Ticket Name *</label>
            <input v-model="ticket.name" type="text" placeholder="e.g., General, VIP" class="input-field w-full"
              :disabled="ticket.isDefault && ticket.defaultTicketId">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Base Price *</label>
            <input v-model="ticket.basePrice" type="number" step="0.01" placeholder="0.00" class="input-field w-full">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description *</label>
          <textarea v-model="ticket.description" rows="2" placeholder="Describe this ticket type..."
            class="input-field w-full" :disabled="ticket.isDefault && ticket.defaultTicketId" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Ticket Quantity *</label>
          <input v-model="ticket.quantity" type="number" placeholder="Available tickets" class="input-field w-full">
        </div>
      </div>

      <button type="button" class="btn-outline w-full py-3" @click="addTicket">
        + Add Another Ticket Type
      </button>

      <div class="flex gap-3">
        <button type="button" class="btn-outline flex-1 py-3" @click="currentStep = 1">
          Back
        </button>
        <button type="button" class="btn-primary flex-1 py-3" :disabled="loading" @click="saveTickets">
          <span v-if="loading">Saving Tickets...</span>
          <span v-else>Next: Pricing Rules</span>
        </button>
      </div>
    </div>

    <!-- Step 3: Pricing Rules -->
    <div v-show="currentStep === 3" class="card space-y-6">
      <h2 class="text-h2">Pricing Rules (Optional)</h2>
      <p class="text-sm text-muted-foreground">Add dynamic pricing rules to your tickets</p>

      <div v-for="(ticket, idx) in savedTickets" :key="ticket.id" class="border border-border p-4 rounded-lg space-y-4">
        <h3 class="font-semibold">{{ ticket.name }} - ${{ ticket.basePrice }}</h3>

        <div v-for="(rule, rIdx) in pricingRules[ticket.id]" :key="rIdx" class="p-4 bg-muted/20 rounded-lg relative">
          <button v-if="pricingRules[ticket.id].length > 0" type="button"
            class="absolute top-2 right-2 text-destructive text-xs hover:underline"
            @click="removePricingRuleFromTicket(ticket.id, rIdx)">
            Remove Info
          </button>

          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Rule Type</label>
            <select v-model="rule.ruleType" class="input-field w-full">
              <option value="None">Select Rule Type</option>
              <option value="EarlyBird">Early Bird Discount</option>
              <option value="LastMinute">Last Minute Discount</option>
              <option value="DemandBased">Demand Based Pricing</option>
            </select>
          </div>

          <!-- Early Bird Fields -->
          <div v-if="rule.ruleType === 'EarlyBird'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Start Date *</label>
                <input v-model="rule.startDate" type="datetime-local" class="input-field w-full">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">End Date *</label>
                <input v-model="rule.endDate" type="datetime-local" class="input-field w-full">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Discount Percent *</label>
              <input v-model="rule.discountPercent" type="number" step="0.01" placeholder="e.g., 20"
                class="input-field w-full">
            </div>
          </div>

          <!-- Last Minute Fields -->
          <div v-if="rule.ruleType === 'LastMinute'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Last N Days Before Event *</label>
              <input v-model="rule.lastNDaysBeforeEvent" type="number" placeholder="e.g., 3" class="input-field w-full">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Discount Percent *</label>
              <input v-model="rule.discountPercent" type="number" step="0.01" placeholder="e.g., 15"
                class="input-field w-full">
            </div>
          </div>

          <!-- Demand Based Fields -->
          <div v-if="rule.ruleType === 'DemandBased'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Threshold Percentage *</label>
              <input v-model="rule.thresholdPercentage" type="number" placeholder="e.g., 70 (after 70% sold)"
                class="input-field w-full">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Price Increase Percent *</label>
              <input v-model="rule.priceIncreasePercent" type="number" step="0.01" placeholder="e.g., 15"
                class="input-field w-full">
            </div>
          </div>

          <div v-if="rule.ruleType !== 'None'" class="mt-3">
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="rule.description" rows="2" placeholder="Describe this pricing rule..."
              class="input-field w-full" />
          </div>
        </div>

        <button type="button" class="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
          @click="addPricingRuleToTicket(ticket.id)">
          + Add Pricing Rule
        </button>
      </div>

      <div class="flex gap-3">
        <button type="button" class="btn-outline flex-1 py-3" @click="currentStep = 2">
          Back
        </button>
        <button type="button" class="btn-primary flex-1 py-3" :disabled="loading" @click="savePricingRules">
          <span v-if="loading">Saving Rules...</span>
          <span v-else>Next: Preview</span>
        </button>
      </div>
    </div>

    <!-- Step 4: Preview -->
    <div v-show="currentStep === 4" class="card space-y-6">
      <h2 class="text-h2">Preview & Publish</h2>

      <div class="space-y-6">
        <div v-if="coverImagePreview" class="rounded-lg overflow-hidden">
          <img :src="coverImagePreview" class="w-full h-64 object-cover" alt="Event cover">
        </div>

        <div>
          <h3 class="text-h3 mb-2">{{ title }}</h3>
          <p class="text-muted-foreground">{{ description || 'No description' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Category</p>
            <p class="font-medium">{{ selectedCategory?.name || 'Not selected' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Capacity</p>
            <p class="font-medium">{{ totalCapacity }} attendees</p>
          </div>
          <div>
            <p class="text-muted-foreground">Venue</p>
            <p class="font-medium">{{ venue || 'Not specified' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Location</p>
            <p class="font-medium">{{ formatLocationForDisplay(location) }}</p>
          </div>
        </div>

        <div>
          <h4 class="font-semibold mb-3">Ticket Types</h4>
          <div class="space-y-2">
            <div v-for="ticket in savedTickets" :key="ticket.id" class="border border-border p-3 rounded-lg">
              <div class="flex justify-between">
                <span class="font-medium">{{ ticket.name }}</span>
                <span class="font-semibold">${{ ticket.basePrice }}</span>
              </div>
              <p class="text-sm text-muted-foreground">{{ ticket.description }}</p>
              <p class="text-xs text-muted-foreground mt-1">Ticket Quantity: {{ ticket.quantity }}</p>

              <div v-if="pricingRules[ticket.id] && pricingRules[ticket.id].length > 0"
                class="mt-2 pt-2 border-t border-border">
                <div v-for="(rule, rIdx) in pricingRules[ticket.id]" :key="rIdx" class="mb-2">
                  <p v-if="rule.ruleType !== 'None'" class="text-xs font-medium">Rule: {{ rule.ruleType }}</p>
                  <p v-if="rule.ruleType !== 'None'" class="text-xs text-muted-foreground">{{ rule.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Telegram Publishing Option -->
      <div class="border border-border rounded-lg p-4 bg-muted/20">
        <label class="flex items-start gap-3 cursor-pointer">
          <input 
            v-model="postToTelegram" 
            type="checkbox" 
            class="mt-1 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
          >
          <div>
            <span class="font-medium text-sm">Post to Telegram Channel</span>
            <p class="text-xs text-muted-foreground mt-1">
              Share this event on our Telegram channel when publishing. This will help reach a wider audience.
            </p>
          </div>
        </label>
      </div>

      <div class="flex gap-3">
        <button type="button" class="btn-outline flex-1 py-3" @click="currentStep = 3">
          Back
        </button>
        <button type="button" class="btn-outline flex-1 py-3" :disabled="loading" @click="saveAsDraft">
          Save as Draft
        </button>
        <button type="button" class="btn-primary flex-1 py-3" :disabled="loading" @click="publishNow">
          <span v-if="loading">Publishing...</span>
          <span v-else>Publish Event</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { eventSchema, ticketSchema } from '../../validation/eventSchema' // Import ticketSchema
import { useEventStore } from '../../stores/event'
import { categoryService } from '../../services/categoryService'
import MapLocationPicker from '../../components/MapLocationPicker.vue'
import { compressImage, compressImages } from '../../utils/imageCompression'

const router = useRouter()
const eventStore = useEventStore()

const currentStep = ref(1)
const steps = ['Details', 'Tickets', 'Pricing', 'Preview']
const loading = ref(false)
const errorMessage = ref('')
const categories = ref([])
const defaultTicketTypes = ref([])

// Event ID after creation
const createdEventId = ref(null)

// VeeValidate form setup
const { handleSubmit, errors, setFieldValue } = useForm({
  validationSchema: eventSchema,
})

// Form fields
const { value: title } = useField('title')
const { value: description } = useField('description')
const { value: categoryId } = useField('categoryId')
const { value: venue } = useField('venue')
const { value: location } = useField('location')
const { value: ticketSalesStart } = useField('ticketSalesStart')
const { value: ticketSalesEnd } = useField('ticketSalesEnd')
const { value: startDate } = useField('startDate')
const { value: endDate } = useField('endDate')
const { value: totalCapacity } = useField('totalCapacity')
const { value: coverImage } = useField('coverImage')

// Additional files
const additionalImages = ref([])
const videos = ref([])

// Preview images
const coverImagePreview = ref(null)
const additionalImagesPreview = ref([])

// Tickets
const tickets = ref([
  { isDefault: true, defaultTicketId: '', name: '', description: '', basePrice: 0, quantity: 0 }
])
const savedTickets = ref([])

// Pricing rules
const pricingRules = ref({})

// Fetch categories and default tickets on mount
onMounted(async () => {
  try {
    const catResponse = await categoryService.getAllCategories()
    categories.value = catResponse

    const ticketResponse = await eventStore.fetchDefaultTicketTypes()
    if (ticketResponse.success) {
      defaultTicketTypes.value = ticketResponse.data
    }

    // Restore form state from localStorage if exists
    restoreFormState()
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
  }
})

// Save form state to localStorage
const saveFormState = () => {
  const formState = {
    currentStep: currentStep.value,
    createdEventId: createdEventId.value,
    formData: {
      title: title.value,
      description: description.value,
      categoryId: categoryId.value,
      venue: venue.value,
      location: location.value,
      ticketSalesStart: ticketSalesStart.value,
      ticketSalesEnd: ticketSalesEnd.value,
      startDate: startDate.value,
      endDate: endDate.value,
      totalCapacity: totalCapacity.value,
    },
    coverImagePreview: coverImagePreview.value,
    additionalImagesPreview: additionalImagesPreview.value,
    tickets: tickets.value,
    savedTickets: savedTickets.value,
    pricingRules: pricingRules.value,
    postToTelegram: postToTelegram.value
  }
  localStorage.setItem('createEventFormState', JSON.stringify(formState))
}

// Restore form state from localStorage
const restoreFormState = () => {
  const savedState = localStorage.getItem('createEventFormState')
  if (!savedState) return

  try {
    const formState = JSON.parse(savedState)
    
    // Restore step and event ID
    currentStep.value = formState.currentStep || 1
    createdEventId.value = formState.createdEventId || null
    
    // Restore form data
    if (formState.formData) {
      title.value = formState.formData.title || ''
      description.value = formState.formData.description || ''
      categoryId.value = formState.formData.categoryId || ''
      venue.value = formState.formData.venue || ''
      location.value = formState.formData.location || ''
      ticketSalesStart.value = formState.formData.ticketSalesStart || ''
      ticketSalesEnd.value = formState.formData.ticketSalesEnd || ''
      startDate.value = formState.formData.startDate || ''
      endDate.value = formState.formData.endDate || ''
      totalCapacity.value = formState.formData.totalCapacity || ''
    }
    
    // Restore image previews
    coverImagePreview.value = formState.coverImagePreview || null
    additionalImagesPreview.value = formState.additionalImagesPreview || []
    
    // Restore tickets and pricing
    if (formState.tickets) tickets.value = formState.tickets
    if (formState.savedTickets) savedTickets.value = formState.savedTickets
    if (formState.pricingRules) pricingRules.value = formState.pricingRules
    if (formState.postToTelegram !== undefined) postToTelegram.value = formState.postToTelegram
  } catch (error) {
    console.error('Failed to restore form state:', error)
    // If restore fails, clear the corrupted data
    localStorage.removeItem('createEventFormState')
  }
}

// Clear form state from localStorage
const clearFormState = () => {
  localStorage.removeItem('createEventFormState')
}

// Telegram publishing checkbox (declared here before watch)
const postToTelegram = ref(false)

// Watch for changes and save to localStorage
watch([currentStep, createdEventId, title, description, categoryId, venue, location, 
       ticketSalesStart, ticketSalesEnd, startDate, endDate, totalCapacity,
       coverImagePreview, additionalImagesPreview, tickets, savedTickets, pricingRules, postToTelegram],
  () => {
    saveFormState()
  },
  { deep: true }
)

// Clear state when component is unmounted (e.g., navigating away)
onBeforeUnmount(() => {
  // Don't clear if we're still in the middle of creating an event
  // Only clear when explicitly published or saved
})

// File handlers
const handleCoverImageChange = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      // Compress the image
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      })

      setFieldValue('coverImage', compressedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        coverImagePreview.value = e.target.result
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Failed to compress image:', error)
      // Fallback to original file if compression fails
      setFieldValue('coverImage', file)
      const reader = new FileReader()
      reader.onload = (e) => {
        coverImagePreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
}

const handleAdditionalImagesChange = async (event) => {
  const files = Array.from(event.target.files)

  try {
    // Compress all images
    const compressedFiles = await compressImages(files, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85
    })

    additionalImages.value = compressedFiles

    // Create previews
    additionalImagesPreview.value = []
    compressedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        additionalImagesPreview.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  } catch (error) {
    console.error('Failed to compress images:', error)
    // Fallback to original files if compression fails
    additionalImages.value = files
    additionalImagesPreview.value = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        additionalImagesPreview.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
}

// Ticket management
const addTicket = () => {
  tickets.value.push({
    isDefault: true,
    defaultTicketId: '',
    name: '',
    description: '',
    basePrice: 0,
    quantity: 0
  })
}

const removeTicket = (idx) => {
  tickets.value.splice(idx, 1)
}

const applyDefaultTicket = (idx) => {
  const ticket = tickets.value[idx]
  const defaultTicket = defaultTicketTypes.value.find(dt => dt.id === ticket.defaultTicketId)
  if (defaultTicket) {
    ticket.name = defaultTicket.name
    ticket.description = defaultTicket.description
  }
}

// Switch to custom ticket and clear fields
const switchToCustomTicket = (idx) => {
  const ticket = tickets.value[idx]
  ticket.isDefault = false
  ticket.defaultTicketId = ''
  // Clear the fields that were populated from default ticket
  ticket.name = ''
  ticket.description = ''
}

// Step 1: Create draft event
const createDraftEvent = handleSubmit(async (values) => {
  console.log("handle submit excuted");

  loading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('Title', values.title)
    if (values.description) formData.append('Description', values.description)
    formData.append('CategoryId', values.categoryId)
    if (values.venue) formData.append('Venue', values.venue)
    if (values.location) formData.append('Location', values.location)
    formData.append('TicketSalesStart', new Date(values.ticketSalesStart).toISOString())
    if (values.ticketSalesEnd) formData.append('TicketSalesEnd', new Date(values.ticketSalesEnd).toISOString())
    formData.append('StartDate', new Date(values.startDate).toISOString())
    formData.append('EndDate', new Date(values.endDate).toISOString())
    formData.append('TotalCapacity', values.totalCapacity)
    formData.append('CoverImage', values.coverImage)

    additionalImages.value.forEach((file) => {
      formData.append('AdditionalImages', file)
    })

    const result = await eventStore.createEvent(formData)

    if (result.success) {
      createdEventId.value = result.event.eventId
      currentStep.value = 2
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'Failed to create event'
  } finally {
    loading.value = false
  }
})

// Step 2: Save tickets
const saveTickets = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    // Validate with ticketSchema
    await ticketSchema.validate({ tickets: tickets.value }, { abortEarly: false })

    const ticketPromises = tickets.value.map(ticket => {
      return eventStore.addTicketType(createdEventId.value, {
        Name: ticket.name,
        Description: ticket.description,
        BasePrice: parseFloat(ticket.basePrice),
        Quantity: parseInt(ticket.quantity)
      })
    })

    const results = await Promise.all(ticketPromises)
    
    // Check for failures
    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
       console.error("Some tickets failed to save:", failures)
       errorMessage.value = failures[0].message || "Failed to save some tickets."
       // Do NOT proceed to next step - keep user on current step to fix the issue
       return
    }

    // Filter successfully saved tickets
    savedTickets.value = results
        .filter(r => r.success && r.ticket)
        .map(r => r.ticket)

    console.log("savedTickets.value", savedTickets.value);

    // Initialize pricing rules for each ticket as array
    savedTickets.value.forEach(ticket => {
      pricingRules.value[ticket.id] = []
      addPricingRuleToTicket(ticket.id)
    })

    currentStep.value = 3
  } catch (error) {
    if (error.name === 'ValidationError') {
       errorMessage.value = error.errors[0] // Show first validation error
    } else {
       errorMessage.value = 'Failed to save tickets'
    }
  } finally {
    loading.value = false
  }
}

// Pricing Rule Management
const addPricingRuleToTicket = (ticketId) => {
  if (!pricingRules.value[ticketId]) pricingRules.value[ticketId] = []
  pricingRules.value[ticketId].push({
    ruleType: 'None',
    description: '',
    startDate: '',
    endDate: '',
    discountPercent: 0,
    lastNDaysBeforeEvent: 0,
    thresholdPercentage: 0,
    priceIncreasePercent: 0
  })
}

const removePricingRuleFromTicket = (ticketId, index) => {
  pricingRules.value[ticketId].splice(index, 1)
}

// Step 3: Save pricing rules
const savePricingRules = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const rulePromises = []
    console.log("pricingRules.value", pricingRules.value);

    // Iterate over tickets
    for (const ticketId in pricingRules.value) {
      const rules = pricingRules.value[ticketId]

      // Iterate over rules for this ticket
      for (const rule of rules) {
        if (rule.ruleType !== 'None') {
          const ruleData = {
            RuleType: rule.ruleType,
            Description: rule.description
          }

          if (rule.ruleType === 'EarlyBird') {
            ruleData.StartDate = new Date(rule.startDate).toISOString()
            ruleData.EndDate = new Date(rule.endDate).toISOString()
            ruleData.DiscountPercent = parseFloat(rule.discountPercent)
          } else if (rule.ruleType === 'LastMinute') {
            ruleData.LastNDaysBeforeEvent = parseInt(rule.lastNDaysBeforeEvent)
            ruleData.DiscountPercent = parseFloat(rule.discountPercent)
          } else if (rule.ruleType === 'DemandBased') {
            ruleData.ThresholdPercentage = parseInt(rule.thresholdPercentage)
            ruleData.PriceIncreasePercent = parseFloat(rule.priceIncreasePercent)
          }

          rulePromises.push(eventStore.addPricingRule(ticketId, ruleData))
        }
      }
    }

    const results = await Promise.all(rulePromises)
    
    // Check for failures
    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
       console.error("Some pricing rules failed to save:", failures)
       errorMessage.value = failures[0].message || "Failed to save some pricing rules."
       // Do NOT proceed to next step - keep user on current step to fix the issue
       return
    }
    
    currentStep.value = 4
  } catch (error) {
    errorMessage.value = 'Failed to save pricing rules'
  } finally {
    loading.value = false
  }
}

// Step 4: Publish or save
const publishNow = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await eventStore.publishEvent(createdEventId.value)

    if (result.success) {
      // If user wants to post to Telegram, do it after successful publish
      if (postToTelegram.value) {
        try {
          await eventStore.postEventToTelegram(createdEventId.value)
          // Success - event published and posted to Telegram
        } catch (telegramError) {
          console.error('Failed to post to Telegram:', telegramError)
          // Don't block the flow - event is already published
          // Just log the error, user can manually post later if needed
        }
      }
      // Clear the saved form state after successful publish
      clearFormState()
      router.push('/organizer/events')
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'Failed to publish event'
  } finally {
    loading.value = false
  }
}

const saveAsDraft = () => {
  // Event is already saved as draft, clear form state and redirect
  clearFormState()
  router.push('/organizer/events')
}

// Helper to format location for display
const formatLocationForDisplay = (loc) => {
  if (!loc) return 'Not specified'
  const parts = loc.split('|')
  if (parts.length === 2) {
    return `Lat: ${parseFloat(parts[0]).toFixed(4)}, Lng: ${parseFloat(parts[1]).toFixed(4)}`
  }
  return loc
}

// Computed
const selectedCategory = computed(() => {
  return categories.value.find(cat => cat.id === categoryId.value)
})
</script>
