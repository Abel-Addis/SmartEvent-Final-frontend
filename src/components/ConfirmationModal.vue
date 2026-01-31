<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div class="card max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 bg-card text-card-foreground border-border/50">
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-2xl', typeClasses]">
              {{ icon }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-card-foreground">{{ title }}</h3>
              <p class="text-muted-foreground text-sm mt-1.5 leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="onCancel"
              class="btn-outline flex-1 py-2.5 font-medium"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              @click="onConfirm"
              :class="['flex-1 py-2.5 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed', confirmButtonClasses]"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to proceed?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  type: { type: String, default: 'danger' }, // danger, warning, info
  loading: Boolean
})

const emit = defineEmits(['confirm', 'cancel'])

const icon = computed(() => {
  switch (props.type) {
    case 'danger': return '🗑️'
    case 'warning': return '⚠️'
    case 'info': return 'ℹ️'
    default: return '❓'
  }
})

const typeClasses = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-destructive/10 text-destructive'
    case 'warning': return 'bg-yellow-500/10 text-yellow-600'
    case 'info': return 'bg-primary/10 text-primary'
    default: return 'bg-muted text-muted-foreground'
  }
})

const confirmButtonClasses = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30'
    case 'warning': return 'bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/30'
    case 'info': return 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
    default: return 'bg-primary text-primary-foreground hover:opacity-90'
  }
})

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>
