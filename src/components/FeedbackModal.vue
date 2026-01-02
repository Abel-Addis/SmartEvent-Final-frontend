<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
        <h3 class="text-lg font-bold">{{ isEditing ? 'Edit Review' : 'Write a Review' }}</h3>
        <button @click="$emit('close')" class="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        
        <!-- Star Rating -->
        <div class="space-y-2 text-center">
          <label class="block text-sm font-medium text-muted-foreground">Rate your experience</label>
          <div class="flex justify-center gap-2">
            <button 
              v-for="star in 5" 
              :key="star"
              type="button"
              @click="rating = star"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
              class="text-3xl transition-transform hover:scale-110 focus:outline-none"
              :class="(hoverRating || rating) >= star ? 'text-amber-400' : 'text-muted-foreground/30'"
            >
              ★
            </button>
          </div>
          <p class="text-xs font-medium h-4" :class="rating ? 'text-primary' : 'invisible'">
            {{ ratingText }}
          </p>
        </div>

        <!-- Comment -->
        <div class="space-y-2">
          <label class="block text-sm font-medium">Your Review</label>
          <textarea 
            v-model="comment" 
            rows="4"
            class="input-field w-full resize-none"
            placeholder="What did you like or dislike about the event?"
          ></textarea>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{{ error }}</p>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
        <button 
          @click="$emit('close')" 
          class="btn-outline px-4 py-2 text-sm"
          :disabled="submitting"
        >
          Cancel
        </button>
        <button 
          @click="handleSubmit" 
          class="btn-primary px-6 py-2 text-sm"
          :disabled="submitting || rating === 0"
        >
          {{ submitting ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  initialRating: {
    type: Number,
    default: 0
  },
  initialComment: {
    type: String,
    default: ''
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  eventId: String,
  feedbackId: String
})

const emit = defineEmits(['close', 'submit'])

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const submitting = ref(false)
const error = ref('')

// Initialize values when opened
watch(() => props.isOpen, (val) => {
  if (val) {
    rating.value = props.initialRating
    comment.value = props.initialComment
    error.value = ''
  }
})

const ratingText = computed(() => {
  const r = hoverRating.value || rating.value
  switch(r) {
    case 1: return 'Poor'
    case 2: return 'Fair'
    case 3: return 'Good'
    case 4: return 'Very Good'
    case 5: return 'Excellent'
    default: return ''
  }
})

const handleSubmit = async () => {
  if (rating.value === 0) {
    error.value = 'Please select a rating'
    return
  }

  submitting.value = true
  error.value = ''

  try {
    await emit('submit', { rating: rating.value, comment: comment.value })
    // Don't close immediately let parent handle success/close
  } catch (err) {
    error.value = err.message || 'Failed to submit'
  } finally {
    submitting.value = false
  }
}
</script>
