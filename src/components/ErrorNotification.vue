<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="show"
      class="fixed top-4 right-4 z-50 max-w-md w-full sm:w-96 animate-in slide-in-from-top-2"
    >
      <div 
        class="card border-l-4 p-4 shadow-lg"
        :class="[
          type === 'success' ? 'border-primary bg-primary/5' : 
          type === 'warning' ? 'border-amber-500 bg-amber-50' : 
          type === 'info' ? 'border-blue-500 bg-blue-50' : 
          'border-destructive bg-destructive/5'
        ]"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="[
                type === 'success' ? 'bg-primary/10' : 
                type === 'warning' ? 'bg-amber-100' : 
                type === 'info' ? 'bg-blue-100' : 
                'bg-destructive/10'
              ]"
            >
              <span class="text-lg">
                {{ type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'info' ? 'ℹ️' : '⚠️' }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 
              class="text-sm font-semibold mb-1"
              :class="[
                type === 'success' ? 'text-primary' : 
                type === 'warning' ? 'text-amber-700' : 
                type === 'info' ? 'text-blue-700' : 
                'text-destructive'
              ]"
            >
              {{ title }}
            </h3>
            <p class="text-sm text-foreground">
              {{ message }}
            </p>
            <p v-if="detail" class="text-xs text-muted-foreground mt-1">
              {{ detail }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            @click="close"
            class="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>

        <!-- Progress Bar (Auto-dismiss indicator) -->
        <div v-if="autoDismiss" class="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full transition-all ease-linear"
            :class="[
              type === 'success' ? 'bg-primary' : 
              type === 'warning' ? 'bg-amber-500' : 
              type === 'info' ? 'bg-blue-500' : 
              'bg-destructive'
            ]"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Error'
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'success', 'warning', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  },
  autoDismiss: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000 // 5 seconds
  }
})

const emit = defineEmits(['close'])

const progress = ref(100)
let timer = null
let progressInterval = null

const close = () => {
  clearTimers()
  emit('close')
}

const clearTimers = () => {
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)
  timer = null
  progressInterval = null
}

const startAutoDismiss = () => {
  if (!props.autoDismiss || !props.show) return

  clearTimers()
  progress.value = 100

  const startTime = Date.now()
  const updateInterval = 50 // Update every 50ms for smooth animation

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 100 - (elapsed / props.duration) * 100)
    progress.value = remaining

    if (remaining <= 0) {
      clearInterval(progressInterval)
    }
  }, updateInterval)

  timer = setTimeout(() => {
    close()
  }, props.duration)
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    startAutoDismiss()
  } else {
    clearTimers()
  }
})

onMounted(() => {
  if (props.show) {
    startAutoDismiss()
  }
})
</script>
