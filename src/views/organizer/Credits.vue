<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="card">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="section-title">Credits</span>
          <h2 class="text-h2 mt-1">
            Manage Your Credits
          </h2>
          <p class="text-muted-foreground mt-1">
            Credits are required to publish events ({{ eventPublishCost }} credits per event)
          </p>
        </div>
        <div class="flex items-center gap-3 px-6 py-3 rounded-lg bg-primary/10 border border-primary/20">
          <span class="text-3xl">💎</span>
          <div>
            <p class="text-xs text-muted-foreground">Current Balance</p>
            <p class="text-2xl font-bold text-primary">{{ currentBalance }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !purchaseInfo" class="flex justify-center items-center py-12">
      <div class="text-muted-foreground">Loading credit information...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 border border-destructive bg-destructive/10 rounded-lg">
      <p class="text-destructive">
        {{ typeof error === 'string' ? error : (error.response?.data?.error || error.message || 'An error occurred') }}
      </p>
    </div>

    <!-- Purchase Credits Section -->
    <div v-else>
      <div class="mb-4">
        <h3 class="text-h3">Purchase Credits</h3>
        <p class="text-sm text-muted-foreground mt-1">
          {{ purchaseInfo?.message || 'Enter the number of credits you want to purchase' }}
        </p>
        <p class="text-sm font-medium text-primary mt-1">
          Price: {{ creditPriceETB }} ETB per credit
        </p>
      </div>

      <!-- Credit Purchase Form -->
      <div class="card max-w-md">
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Number of Credits</label>
            <input
              v-model.number="creditsToBy"
              type="number"
              min="1"
              placeholder="Enter credits amount"
              class="input-field w-full"
            />
          </div>

          <div class="p-4 rounded-lg bg-muted/50 border border-border">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-muted-foreground">Credits:</span>
              <span class="font-semibold">{{ creditsToBy || 0 }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-muted-foreground">Price per credit:</span>
              <span class="font-semibold">{{ creditPriceETB }} ETB</span>
            </div>
            <div class="h-px bg-border my-2"></div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Total Amount:</span>
              <span class="text-xl font-bold text-primary">{{ totalAmount }} ETB</span>
            </div>
          </div>

          <button
            class="btn-primary w-full py-2.5"
            @click="handlePurchase"
            :disabled="loading || !creditsToBy || creditsToBy < 1"
          >
            {{ loading ? 'Processing...' : 'Buy Credits' }}
          </button>
        </div>
      </div>

      <!-- Suggested Packages -->
      <div class="mt-6">
        <h4 class="text-sm font-semibold mb-3">Quick Select</h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="amount in [5, 10, 25, 50]"
            :key="amount"
            class="card hover:shadow-md transition-all hover:border-primary/30 p-4 text-center"
            @click="creditsToBy = amount"
          >
            <div class="text-2xl mb-1">💎</div>
            <div class="font-bold">{{ amount }}</div>
            <div class="text-xs text-muted-foreground">{{ amount * creditPriceETB }} ETB</div>
          </button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCreditStore } from '../../stores/credit'
import { creditService } from '../../services/creditService'
import ErrorNotification from '@/components/ErrorNotification.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'
import { useConfirmation } from '@/composables/useConfirmation'

const { showError, errorTitle, errorMessage, errorDetail, errorStatusCode, errorType, displayError, closeError } = useErrorNotification()
const { showConfirm, confirmTitle, confirmMessage, confirmType, confirmLoading, confirmButtonText, askConfirmation, onConfirm, onCancel } = useConfirmation()

const creditStore = useCreditStore()
const route = useRoute() // Call useRoute at the top level

// Local state
const creditsToBy = ref(null)
const paymentReference = ref(null) // Store payment reference for verification

// Computed properties from store
const currentBalance = computed(() => creditStore.currentBalance)
const purchaseInfo = computed(() => creditStore.purchaseInfo)
const creditPriceETB = computed(() => creditStore.creditPriceETB)
const eventPublishCost = computed(() => creditStore.eventPublishCost)
const transactions = computed(() => creditStore.sortedTransactions)
const loading = computed(() => creditStore.loading)
const error = computed(() => creditStore.error)

// Computed total amount
const totalAmount = computed(() => {
  return (creditsToBy.value || 0) * creditPriceETB.value
})

// Fetch data on mount and check for payment callback
onMounted(async () => {
  await Promise.all([
    creditStore.fetchBalance(),
    creditStore.fetchPurchaseInfo(),
    creditStore.fetchTransactions()
  ])

  // Check if we have a stored payment reference to verify
  // This means user returned from payment gateway
  const storedPaymentRef = sessionStorage.getItem('creditPaymentReference')
  if (storedPaymentRef) {
    paymentReference.value = storedPaymentRef
    await handlePaymentCallback()
    // Clear the stored reference after processing
    sessionStorage.removeItem('creditPaymentReference')
  }
})

// Handle purchase - initialize payment and redirect to Chapa
const handlePurchase = async () => {
  if (!creditsToBy.value || creditsToBy.value < 1) {
    displayError('Please enter a valid number of credits', 'Invalid Amount')
    return
  }

  const confirmed = await askConfirmation({
    title: 'Purchase Credits',
    message: `Purchase ${creditsToBy.value} credits for ${totalAmount.value} ETB?\n\nYou will be redirected to Chapa payment gateway.`,
    type: 'info',
    confirmText: 'Continue to Payment'
  })
  
  if (confirmed) {
    try {
      creditStore.loading = true
      
      // Step 1: Create pending transaction
      const transactionResponse = await creditService.buyCredits(creditsToBy.value)
      
      if (!transactionResponse || !transactionResponse.creditTransactionId) {
        displayError('Failed to create transaction. Please try again.', 'Transaction Failed')
        return
      }
      
      // Step 2: Initialize payment with the transaction ID
      const paymentResponse = await creditService.initializePayment(transactionResponse.creditTransactionId)
      
      // Step 3: Store payment reference for verification after payment
      if (paymentResponse.paymentReference) {
        paymentReference.value = paymentResponse.paymentReference
        // Store in sessionStorage so we can verify when user returns
        sessionStorage.setItem('creditPaymentReference', paymentResponse.paymentReference)
      }
      
      // Step 4: Redirect to Chapa checkout URL
      if (paymentResponse.checkoutUrl) {
        // window.location.href = paymentResponse.checkoutUrl
        window.open(paymentResponse.checkoutUrl, '_blank')
        displayError('Payment page opened in a new tab. Please complete payment there.', 'Payment Initiated', 'success')
      } else {
        displayError('Payment initialization failed: No checkout URL received', 'Payment Error')
        sessionStorage.removeItem('creditPaymentReference')
      }
    } catch (err) {
      displayError(err, 'Payment Initialization Failed')
      sessionStorage.removeItem('creditPaymentReference')
    } finally {
      creditStore.loading = false
    }
  }
}

// Handle payment callback
const handlePaymentCallback = async () => {
  try {
    // Use the paymentReference we stored (not from URL)
    // The backend parameter is named tx_ref but it expects the paymentReference value
    if (!paymentReference.value) {
      displayError('Payment callback failed: Payment reference not found.', 'Verification Failed')
      return
    }
    
    // Verify payment using the paymentReference from initialize response
    // The backend returns Ok("Credit purchase completed successfully!") on success
    // or BadRequest on failure (which will throw an error)
    await creditService.verifyPayment(paymentReference.value)
    
    // If we reach here, payment was successful
    displayError('Payment successful! Your credits have been added.', 'Success', 'success')
    // Refresh balance and transactions
    await creditStore.fetchBalance()
    await creditStore.fetchTransactions()
    
    // Clear payment reference
    paymentReference.value = null
  } catch (err) {
    console.error('Payment callback error:', err)
    displayError(err, 'Payment Verification Failed')
    paymentReference.value = null
  }
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
