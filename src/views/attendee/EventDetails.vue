<template>
  <div v-if="loading" class="text-center py-12">
    <p class="text-muted-foreground">Loading event details...</p>
  </div>
  <div v-else-if="!event" class="text-center py-12">
    <p class="text-muted-foreground">Event not found.</p>
  </div>
  <div v-else class="space-y-8">
    <!-- Event Hero -->
    <div class="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 sm:p-12 relative overflow-hidden">
      <img v-if="event.bannerImageUrl" :src="event.bannerImageUrl"
        class="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div class="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
        <div>
          <h1 class="text-h1 font-bold mb-4">
            {{ event.title }}
          </h1>
          <div class="flex flex-wrap gap-4 text-lg">
            <span>📅 {{ formattedDateRange }}</span>
            <span>📍 {{ event.venue }}</span>
          </div>
        </div>
        <button :class="['btn-primary px-6 py-3 text-lg', isFavorite && 'ring-2 ring-offset-2 ring-primary']"
          @click="toggleFavorite">
          {{ isFavorite ? '❤️ Saved' : '🤍 Save' }}
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-4 border-b border-border overflow-x-auto">
      <button v-for="tab in tabs" :key="tab"
        :class="['px-4 py-3 font-medium transition-colors border-b-2', activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground']"
        @click="activeTab = tab">
        {{ tab }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="space-y-6">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'Overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div>
            <h3 class="text-h3 font-bold mb-3">
              About This Event
            </h3>
            <p class="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {{ event.description || event.Description || 'No description available.' }}
            </p>
          </div>

          <div>
            <h3 class="text-h3 font-bold mb-3">
              What's Included
            </h3>
            <ul class="space-y-2 text-lg">
              <li>✓ Live Performance</li>
              <li>✓ Interactive Sessions</li>
              <li>✓ Networking Opportunities</li>
            </ul>
          </div>
        </div>

        <div class="card h-fit">
          <h4 class="text-h4 font-bold mb-6">
            Get Tickets
          </h4>
          <div class="space-y-3 mb-6">
            <div v-for="ticket in event.ticketTypes" :key="ticket.ticketTypeId"
              class="border border-border rounded-lg p-4">
              <p class="text-sm font-medium mb-1">
                {{ ticket.name }}
              </p>
              <p class="text-2xl font-bold text-primary">
                {{ formatCurrency(ticket.finalPrice || ticket.basePrice) }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ ticket.isAvailable ? (ticket.isSoldOut ? 'Sold Out' : 'Available') : 'Unavailable' }}
              </p>
              <p v-if="ticket.finalPrice && ticket.basePrice && ticket.finalPrice !== ticket.basePrice"
                class="text-xs mt-1">
                <span class="font-medium">
                  Base: {{ formatCurrency(ticket.basePrice) }}
                </span>
                <span :class="[
                  'ml-2 px-2 py-0.5 rounded-full',
                  ticket.finalPrice < ticket.basePrice
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                ]">
                  {{ ticket.finalPrice < ticket.basePrice ? 'Discount applied' : 'Dynamic price increase' }} ({{
                    priceDiffPercent(ticket) }}) </span>
              </p>
            </div>
            <div v-if="(!event.ticketTypes || event.ticketTypes.length === 0)" class="text-muted-foreground text-sm">
              No tickets available online.
            </div>
          </div>
          <router-link :to="'/dashboard/checkout/' + eventId" class="btn-primary w-full py-3 text-center block"
            v-if="event.ticketTypes && event.ticketTypes.length > 0 && event.ticketTypes.some(t => t.isAvailable && !t.isSoldOut)">
            Buy Tickets
          </router-link>
        </div>
      </div>

      <!-- Schedule Tab -->
      <div v-if="activeTab === 'Schedule'" class="space-y-4">
        <div class="card">
          <h4 class="font-bold mb-4">
            Event Schedule
          </h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div class="flex gap-3 items-center">
                <span class="text-2xl">🏁</span>
                <div>
                  <p class="font-semibold">Start Time</p>
                  <p class="text-sm text-muted-foreground">{{ new Date(event.startDate).toLocaleString() }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div class="flex gap-3 items-center">
                <span class="text-2xl">🏁</span>
                <div>
                  <p class="font-semibold">End Time</p>
                  <p class="text-sm text-muted-foreground">{{ new Date(event.endDate).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Location Tab -->
      <div v-if="activeTab === 'Location'" class="space-y-4">
        <div class="card">
          <h4 class="text-h4 font-bold mb-4">Event Location</h4>
          <div v-if="event.venue" class="mb-4">
            <p class="text-lg font-semibold">{{ event.venue }}</p>
          </div>
          <MapLocationDisplay :location="event.location" :venue="event.venue" />
        </div>
      </div>

      <!-- Organizer Tab -->
      <div v-if="activeTab === 'Organizer'" class="space-y-6">
        <div class="card bg-muted/20">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
              🏢
            </div>
            <div>
              <h4 class="text-h3 font-bold">{{ event.organizerName || 'Event Organizer' }}</h4>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex text-amber-500 font-bold">
                  <span v-if="event.organizerAverageRating > 0">{{ event.organizerAverageRating.toFixed(1) }} ★</span>
                  <span v-else>No ratings yet</span>
                </div>
                <span class="text-sm text-muted-foreground">({{ event.organizerTotalRatings }} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h4 class="text-h4 font-bold mb-6">Organizer Reviews</h4>

          <div v-if="loadingOrganizerReviews" class="text-center py-8">
            <div class="animate-spin text-4xl mb-2">⏳</div>
            <p class="text-muted-foreground">Loading reviews...</p>
          </div>

          <div v-else-if="organizerReviews.length === 0" class="text-center py-8 text-muted-foreground">
            No reviews found for this organizer.
          </div>

          <div v-else class="space-y-6">
            <div v-for="review in organizerReviews" :key="review.feedbackId"
              class="border-b border-border last:border-0 pb-6 last:pb-0">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                    {{ review.userName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-semibold">{{ review.userName }}</p>
                    <p class="text-xs text-muted-foreground">{{ new Date(review.createdAt).toLocaleDateString() }} •
                      Event: {{ review.eventTitle }}</p>
                  </div>
                </div>
                <div class="flex text-amber-500 text-sm">
                  <span v-for="n in 5" :key="n">{{ n <= review.rating ? '★' : '☆' }}</span>
                </div>
              </div>
              <p class="text-foreground/90 whitespace-pre-wrap ml-13 pl-13">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Section (Only visible if eligible or has review) -->
    <div v-if="userReview || isEligibleForFeedback" class="mt-8 pt-8 border-t border-border">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-h3 font-bold">Your Review</h3>
        <button v-if="isEligibleForFeedback && !userReview" @click="openFeedbackModal" class="btn-primary px-4 py-2">
          ★ Give Feedback
        </button>
      </div>

      <!-- Existing Review Card -->
      <div v-if="userReview" class="card bg-muted/30 border-muted">
        <div class="flex justify-between items-start">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {{ userReview.userName?.charAt(0) || 'U' }}
            </div>
            <div>
              <p class="font-semibold">{{ userReview.userName }}</p>
              <div class="flex text-amber-500 text-sm">
                <span v-for="n in 5" :key="n">{{ n <= userReview.rating ? '★' : '☆' }}</span>
              </div>
              <p class="text-sm text-muted-foreground mt-1">{{ new Date(userReview.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="editReview" class="text-sm text-primary hover:underline">Edit</button>
            <button @click="deleteReview" class="text-sm text-destructive hover:underline">Delete</button>
          </div>
        </div>
        <p class="mt-4 text-foreground/90 whitespace-pre-wrap">{{ userReview.comment }}</p>
      </div>
    </div>

    <!-- Feedback Modal -->
    <FeedbackModal :isOpen="showFeedbackModal" :initialRating="userReview?.rating || 0"
      :initialComment="userReview?.comment || ''" :isEditing="isEditingReview" @close="showFeedbackModal = false"
      @submit="handleFeedbackSubmit" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { attendeeService } from '@/services/attendeeService'
import { feedbackService } from '@/services/feedbackService'
import FeedbackModal from '@/components/FeedbackModal.vue'
import MapLocationDisplay from '@/components/MapLocationDisplay.vue'

const route = useRoute()
const eventId = route.params.id

const event = ref(null)
const loading = ref(true)
const activeTab = ref('Overview')
const isFavorite = ref(false)
const tabs = ['Overview', 'Schedule', 'Location', 'Organizer']

// Feedback State
const userReview = ref(null)
const isEligibleForFeedback = ref(false)
const showFeedbackModal = ref(false)
const isEditingReview = ref(false)

const formattedDateRange = computed(() => {
  if (!event.value) return ''
  const start = new Date(event.value.startDate)
  const end = new Date(event.value.endDate)
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
})

const priceDiffPercent = (ticket) => {
  if (!ticket || !ticket.finalPrice || !ticket.basePrice) return ''
  const diff = ((ticket.finalPrice - ticket.basePrice) / ticket.basePrice) * 100
  const rounded = Math.abs(Math.round(diff))
  return diff < 0 ? `-${rounded}%` : `+${rounded}%`
}

onMounted(async () => {
  await loadEventDetails()
})

const loadEventDetails = async () => {
  loading.value = true
  try {
    const data = await attendeeService.getEventDetails(eventId)
    event.value = data

    // Check feedback status
    await Promise.all([
      checkFeedbackStatus(),
      loadFeedbackSummary()
    ])
  } catch (err) {
    console.error("Failed to load event details")
  } finally {
    loading.value = false
  }
}

const feedbackSummary = ref(null)

const loadFeedbackSummary = async () => {
  try {
    const summary = await feedbackService.getEventFeedbackSummary(eventId)
    feedbackSummary.value = summary
  } catch (err) {
    console.error("Failed to load feedback summary", err)
  }
}

const checkFeedbackStatus = async () => {
  try {
    // 1. Check if user already reviewed
    const myReview = await feedbackService.getMyFeedbackForEvent(eventId)
    if (myReview && myReview.feedback) {
      userReview.value = myReview.feedback // The API returns { ..., feedback: { ... } }
      isEligibleForFeedback.value = false
    } else {
      // 2. If no review, check if eligible
      const eligibleList = await feedbackService.getEligibleEvents()
      // Backend returns list of { eventId, title... }
      const isEligible = eligibleList.find(e => e.eventId === eventId)
      isEligibleForFeedback.value = !!isEligible
    }
  } catch (err) {
    console.log("Not eligible or not logged in", err)
  }
}

// Organizer Reviews
const organizerReviews = ref([])
const loadingOrganizerReviews = ref(false)

const loadOrganizerReviews = async () => {
  if (organizerReviews.value.length > 0) return // Already loaded
  loadingOrganizerReviews.value = true
  try {
    const reviews = await feedbackService.getFeedbacksForOrganizer(event.value.organizerId)
    organizerReviews.value = reviews || []
  } catch (err) {
    console.error("Failed to load organizer reviews", err)
  } finally {
    loadingOrganizerReviews.value = false
  }
}

import { watch } from 'vue'
watch(activeTab, (newTab) => {
  if (newTab === 'Organizer' && event.value?.organizerId) {
    loadOrganizerReviews()
  }
})

const openFeedbackModal = () => {
  isEditingReview.value = false
  showFeedbackModal.value = true
}

const editReview = () => {
  isEditingReview.value = true
  showFeedbackModal.value = true
}

const handleFeedbackSubmit = async (payload) => {
  try {
    if (isEditingReview.value) {
      await feedbackService.updateFeedback(userReview.value.feedbackId, payload)
    } else {
      await feedbackService.submitFeedback(eventId, payload)
    }
    // Refresh to show updated review
    await checkFeedbackStatus()
    showFeedbackModal.value = false
  } catch (err) {
    console.error("Failed to submit feedback", err)
    throw err // Modal handles error display
  }
}

const deleteReview = async () => {
  if (!confirm("Are you sure you want to delete your review?")) return
  try {
    await feedbackService.deleteFeedback(userReview.value.feedbackId)
    userReview.value = null
    // Check eligibility again (might be eligible to review again? Backend logic decides)
    // Actually if deleted, and event is still "past", they should be eligible again?
    // Let's re-check
    await checkFeedbackStatus()
  } catch (err) {
    console.error("Failed to delete review", err)
  }
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(val)
}
</script>
