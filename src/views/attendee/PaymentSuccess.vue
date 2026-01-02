<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card max-w-md w-full text-center py-12">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin text-4xl">⏳</div>
        <h2 class="text-h3 font-bold">Verifying Payment...</h2>
        <p class="text-muted-foreground">Please wait while we confirm your transaction.</p>
      </div>

      <div v-else-if="success" class="space-y-4">
        <div class="text-6xl">🎉</div>
        <h2 class="text-h2 font-bold text-success">Payment Successful!</h2>
        <p class="text-muted-foreground">Your booking has been confirmed.</p>
        <router-link to="/dashboard/tickets" class="btn-primary inline-block mt-4">
          View My Tickets
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div class="text-6xl">⚠️</div>
        <h2 class="text-h2 font-bold text-destructive">Payment Verification Failed</h2>
        <p class="text-muted-foreground">{{ error }}</p>
        <div class="flex gap-2 justify-center mt-4">
          <router-link to="/dashboard" class="btn-outline">
            Go Home
          </router-link>
          <button @click="verify" class="btn-primary">
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { attendeeService } from '../../services/attendeeService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(() => {
  verify()
})

const verify = async () => {
  const txRef = route.query.tx_ref
  if (!txRef) {
    loading.value = false
    error.value = "No transaction reference found."
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const result = await attendeeService.verifyPayment(txRef)
    if (result) {
      success.value = true
    } else {
      error.value = "Payment verification returned false."
    }
  } catch (err) {
    console.error(err)
    error.value = err.message || "Verification failed."
  } finally {
    loading.value = false
  }
}
</script>
