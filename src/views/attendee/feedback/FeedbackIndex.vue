<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Your Feedback</h1>
        <p class="text-muted-foreground mt-1">Share your experience and view your past reviews.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-border overflow-x-auto">
      <button 
        v-for="tab in ['Pending Reviews', 'My Reviews']" 
        :key="tab"
        @click="activeTab = tab"
        class="pb-3 px-1 relative transition-colors"
        :class="activeTab === tab ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'"
      >
        {{ tab }}
        <div 
          v-if="activeTab === tab" 
          class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"
        ></div>
      </button>
    </div>

    <!-- Content -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin text-4xl mb-4">⏳</div>
      <p class="text-muted-foreground">Loading...</p>
    </div>

    <div v-else>
      <!-- Pending Reviews Tab -->
      <div v-if="activeTab === 'Pending Reviews'" class="space-y-6">
        <div v-if="pendingEvents.length === 0" class="text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-xl font-semibold mb-2">All Caught Up!</h3>
          <p class="text-muted-foreground max-w-md mx-auto">
            You don't have any events to review right now. Attend more events to share your experience!
          </p>
          <router-link to="/dashboard/events" class="btn-primary mt-6 inline-block px-6 py-2">
            Browse Events
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="event in pendingEvents" 
            :key="event.eventId"
            class="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50"
          >
            <!-- Event Image/Placeholder -->
            <div class="h-32 bg-muted relative overflow-hidden">
               <img 
                v-if="event.bannerImageUrl" 
                :src="event.bannerImageUrl" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span class="text-4xl">📅</span>
              </div>
              <div class="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs backdrop-blur-sm">
                {{ new Date(event.endDate).toLocaleDateString() }}
              </div>
            </div>

            <div class="p-5">
              <h3 class="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {{ event.title }}
              </h3>
              <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
                {{ event.venue }}
              </p>
              
              <button 
                @click="openReviewModal(event)"
                class="w-full btn-outline py-2 border-dashed group-hover:border-solid group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
              >
                ★ Write a Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- My Reviews Tab -->
      <div v-if="activeTab === 'My Reviews'" class="space-y-6">
        <div v-if="myReviews.length === 0" class="text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border">
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-xl font-semibold mb-2">No Reviews Yet</h3>
          <p class="text-muted-foreground">
            You haven't written any reviews yet.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="review in myReviews" 
            :key="review.feedbackId"
            class="bg-card border border-border rounded-xl p-6 transition hover:border-accent/50"
          >
            <div class="flex justify-between items-start gap-4">
              <div>
                <h3 class="font-bold text-lg text-primary mb-1">
                  {{ review.eventTitle }}
                </h3>
                <div class="flex items-center gap-2 mb-3">
                  <div class="flex text-amber-500">
                    <span v-for="n in 5" :key="n">{{ n <= review.rating ? '★' : '☆' }}</span>
                  </div>
                  <span class="text-xs text-muted-foreground">• {{ new Date(review.createdAt).toLocaleDateString() }}</span>
                </div>
                <p class="text-foreground/80 whitespace-pre-wrap">{{ review.comment }}</p>
              </div>

              <div class="flex flex-col gap-2">
                <button 
                  @click="editReview(review)"
                  class="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition"
                  title="Edit Review"
                >
                  ✏️
                </button>
                <button 
                  @click="deleteReview(review)"
                  class="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition"
                  title="Delete Review"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Review Modal -->
    <FeedbackModal 
      :isOpen="showModal"
      :eventId="selectedEvent?.eventId"
      :feedbackId="selectedReview?.feedbackId"
      :initialRating="selectedReview?.rating || 0"
      :initialComment="selectedReview?.comment || ''"
      :isEditing="isEditing"
      @close="closeModal"
      @submit="handleSubmit"
    />

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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { feedbackService } from '@/services/feedbackService'
import FeedbackModal from '@/components/FeedbackModal.vue'
import ErrorNotification from '@/components/ErrorNotification.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'
import { useConfirmation } from '@/composables/useConfirmation'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()
const { showConfirm, confirmTitle, confirmMessage, confirmType, confirmLoading, confirmButtonText, askConfirmation, onConfirm, onCancel } = useConfirmation()

const activeTab = ref('Pending Reviews')
const loading = ref(true)
const pendingEvents = ref([])
const myReviews = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const selectedEvent = ref(null)
const selectedReview = ref(null)

onMounted(() => {
  loadData()
})

watch(activeTab, () => {
    // Optional: Reload data when switching tabs to ensure freshness
    loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [pending, history] = await Promise.all([
      feedbackService.getEligibleEvents(),
      feedbackService.getMyFeedbackHistory()
    ])
    pendingEvents.value = pending || []
    myReviews.value = history || []
  } catch (err) {
    displayError(err, "Failed to load feedback data")
  } finally {
    loading.value = false
  }
}

const openReviewModal = (event) => {
  selectedEvent.value = event
  selectedReview.value = null
  isEditing.value = false
  showModal.value = true
}

const editReview = (review) => {
  selectedEvent.value = { eventId: review.eventId } // Minimal event object for modal if needed
  selectedReview.value = review
  isEditing.value = true
  showModal.value = true
}

const deleteReview = async (review) => {
  const confirmed = await askConfirmation({
    title: 'Delete Review',
    message: 'Are you sure you want to delete this review? This action cannot be undone.',
    confirmText: 'Delete Review',
    type: 'danger'
  })

  if (!confirmed) return
  
  try {
    await feedbackService.deleteFeedback(review.feedbackId)
    displayError('Review deleted successfully', 'Success', 'success')
    await loadData() // Refresh list
  } catch (err) {
    displayError(err, "Failed to delete review")
  }
}

const closeModal = () => {
  showModal.value = false
  selectedEvent.value = null
  selectedReview.value = null
}

const handleSubmit = async (payload) => {
  try {
    if (isEditing.value) {
      await feedbackService.updateFeedback(selectedReview.value.feedbackId, payload)
    } else {
      await feedbackService.submitFeedback(selectedEvent.value.eventId, payload)
    }
    displayError(`Feedback ${isEditing.value ? 'updated' : 'submitted'} successfully!`, 'Success', 'success')
    await loadData()
    closeModal()
  } catch (err) {
    console.error("Failed to submit feedback", err)
    // Modal usually handles error display, but re-throw if needed or show toast
    throw err 
  }
}
</script>
