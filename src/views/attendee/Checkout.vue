```html
<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Checkout Form -->
    <div class="lg:col-span-2 space-y-6">
      <div class="space-y-4">
        <h2 class="text-h2 font-bold">
          Step {{ currentStep }} of 3
        </h2>
        <div class="flex gap-2">
          <div
            v-for="step in 3"
            :key="step"
            :class="['flex-1 h-1 rounded-full transition-colors', step <= currentStep ? 'bg-primary' : 'bg-border']"
          />
        </div>
      </div>

      <!-- Step 1: Ticket Selection -->
      <div
        v-if="currentStep === 1"
        class="card space-y-4"
      >
        <h3 class="text-h3 font-bold">
          Select Tickets
        </h3>
        <div class="space-y-3">
          <div
            v-for="ticket in tickets"
            :key="ticket.ticketTypeId"
            class="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">
                  {{ ticket.name }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ ticket.description || '' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-primary">
                  {{ formatCurrency(ticket.finalPrice || ticket.basePrice || 0) }}
                </p>
                 <p
                  v-if="ticket.finalPrice && ticket.basePrice && ticket.finalPrice !== ticket.basePrice"
                  class="text-xs text-muted-foreground mt-1"
                >
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full',
                      ticket.finalPrice < ticket.basePrice
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    ]"
                  >
                    {{ ticket.finalPrice < ticket.basePrice ? 'Save' : 'Dynamic' }}
                    {{ priceDiffPercent(ticket) }}
                  </span>
                </p>
                
                <!-- Computed Pricing Rules Breakdown -->
                <div v-if="getTicketRules(ticket).length > 0" class="mt-2 text-xs text-right space-y-1">
                    <div v-for="rule in getTicketRules(ticket)" :key="rule.id" class="text-muted-foreground">
                        <span class="font-medium">{{ rule.description }}</span>
                        <span v-if="rule.discountPercent" class="text-success ml-1">(-{{ rule.discountPercent }}%)</span>
                        <span v-if="rule.priceIncreasePercent" class="text-warning ml-1">(+{{ rule.priceIncreasePercent }}%)</span>
                    </div>
                </div>
              </div>
            </div>
            
            <!-- Quantity Controls (Always visible per ticket) -->
            <div class="mt-4 flex items-center justify-end gap-3">
              <span class="text-sm text-muted-foreground mr-auto" v-if="ticket.quantity > 0">
                 {{ formatCurrency((ticket.finalPrice || ticket.basePrice || 0) * ticket.quantity) }}
              </span>
              <button
                class="btn-outline w-8 h-8 flex items-center justify-center p-0 rounded-full"
                @click.stop="decreaseQty(ticket)"
                :disabled="ticket.quantity <= 0"
              >
                -
              </button>
              <span class="text-lg font-bold w-6 text-center">{{ ticket.quantity }}</span>
              <button
                class="btn-outline w-8 h-8 flex items-center justify-center p-0 rounded-full"
                @click.stop="increaseQty(ticket)"
                :disabled="isSoldOut(ticket)"
              >
                +
              </button>
            </div>
            <p v-if="isSoldOut(ticket)" class="text-xs text-destructive text-right mt-1">Sold Out</p>
          </div>
        </div>
        
        <div class="flex justify-between items-center pt-4 border-t border-border">
            <div class="text-lg font-bold">
                Total: <span class="text-primary">{{ formatCurrency(grandTotal) }}</span>
            </div>
            <button
            class="btn-primary w-1/2 py-3"
            @click="proceedToPayment"
            :disabled="totalTickets === 0"
            >
            Continue
            </button>
        </div>
      </div>

      <!-- Step 2: Confirm -->
      <div
        v-if="currentStep === 2"
        class="card space-y-4"
      >
        <h3 class="text-h3 font-bold">
          Confirm Order
        </h3>
        
        <div class="space-y-4">
           <div class="bg-muted p-4 rounded-lg">
             <h4 class="font-semibold mb-2">Order Summary</h4>
             <div class="space-y-2">
                 <div v-for="item in selectedTickets" :key="item.ticketTypeId" class="flex justify-between text-sm">
                    <span>{{ item.name }} x{{ item.quantity }}</span>
                    <span class="font-semibold">{{ formatCurrency((item.finalPrice || item.basePrice || 0) * item.quantity) }}</span>
                 </div>
             </div>
             <div class="flex justify-between text-sm mt-4 pt-4 border-t border-border">
                <span class="font-bold">Total</span>
                <span class="font-bold text-primary">{{ formatCurrency(grandTotal) }}</span>
             </div>
           </div>
           
           <div class="text-sm text-muted-foreground">
             Please review your order before proceeding to payment.
           </div>
        </div>

        <div class="flex gap-3">
          <button
            class="btn-outline flex-1 py-3"
            @click="currentStep = 1"
            :disabled="processing"
          >
            Back
          </button>
          <button
            class="btn-primary flex-1 py-3"
            @click="initiateBooking"
            :disabled="processing"
          >
            {{ processing ? 'Processing...' : 'Proceed to Payment' }}
          </button>
        </div>
      </div>

      <!-- Step 3: Payment & Verification -->
      <div
        v-if="currentStep === 3"
        class="card space-y-4"
      >
        <h3 class="text-h3 font-bold">
          Complete Payment
        </h3>

        <div v-if="paymentSuccess" class="text-center py-8 space-y-4">
             <div class="text-6xl">🎉</div>
             <h4 class="text-h3 text-success font-bold">Payment Verified!</h4>
             <p class="text-muted-foreground">Your booking has been confirmed.</p>
             <router-link to="/dashboard/tickets" class="btn-primary inline-block mt-4">
                View My Tickets
             </router-link>
        </div>
        
        <div v-else class="space-y-6">
           <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
             <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">Instructions</h4>
             <ol class="list-decimal list-inside space-y-1 text-sm text-blue-600 dark:text-blue-400">
                <li>Click <strong>Pay Now</strong> to open the secure payment page.</li>
                <li>Complete the payment in the new window.</li>
                <li>Return here and click <strong>Verify Payment</strong>.</li>
             </ol>
           </div>

            <div class="flex flex-col gap-4">
                 <a 
                   v-if="paymentDetails?.checkoutUrl"
                   :href="paymentDetails.checkoutUrl" 
                   target="_blank"
                   class="btn-primary w-full py-4 text-center text-lg font-bold"
                 >
                    Pay Now ↗
                 </a>
                 
                 <div class="text-center text-sm text-muted-foreground">
                    After paying, please confirm:
                 </div>

                 <button
                    class="btn-outline w-full py-4 font-bold border-2"
                    @click="verifyPaymentStatus"
                    :disabled="verifying"
                  >
                    {{ verifying ? 'Verifying...' : 'Verify Payment' }}
                  </button>
            </div>
            
            <p v-if="verificationError" class="text-destructive text-center text-sm">
                {{ verificationError }}
            </p>
        </div>
      </div>
    </div>

    <!-- Order Summary (Sidebar) -->
    <div class="lg:col-span-1">
      <div class="card sticky top-8 space-y-4">
        <h3 class="text-h3 font-bold">
          Order Summary
        </h3>
        <div v-if="event" class="space-y-2 pb-4 border-b border-border">
          <p class="text-lg font-semibold">
            {{ event.title }}
          </p>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(event.startDate) }}
          </p>
           <p class="text-sm text-muted-foreground">
            {{ event.venue }}
          </p>
        </div>

        <div class="space-y-2">
           <div v-if="totalTickets === 0" class="text-sm text-muted-foreground italic">
               No tickets selected
           </div>
           <div v-else>
               <div v-for="item in selectedTickets" :key="item.ticketTypeId" class="flex justify-between text-sm mb-1">
                    <span>{{ item.name }} x{{ item.quantity }}</span>
                    <span>{{ formatCurrency((item.finalPrice || item.basePrice || 0) * item.quantity) }}</span>
                 </div>
           </div>

          <div class="border-t border-border pt-2 flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span class="text-primary">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { attendeeService } from '../../services/attendeeService'

const route = useRoute()
const eventId = route.params.id

const currentStep = ref(1)
const processing = ref(false)
const verifying = ref(false)
const event = ref(null)
const tickets = ref([]) // Ticket Types with .quantity
const paymentDetails = ref(null)
const paymentSuccess = ref(false)
const verificationError = ref('')

onMounted(async () => {
  await loadEventDetails()
})

const loadEventDetails = async () => {
  try {
    const data = await attendeeService.getEventDetails(eventId)
    event.value = data
    // Map ticket types from event detail and init quantity
    tickets.value = (data.ticketTypes || []).map(t => ({
        ...t,
        quantity: 0
    }))
  } catch (err) {
    alert("Failed to load event details")
  }
}

const increaseQty = (ticket) => {
    // Check limits if available (e.g. max per user or availability)
  ticket.quantity++
}

const decreaseQty = (ticket) => {
  if (ticket.quantity > 0) ticket.quantity--
}

const isSoldOut = (ticket) => {
    // Assuming backend provides isSoldOut or similar
    // Based on previous DTO check: TicketTypeDto has IsSoldOut
    return ticket.isSoldOut
}

const selectedTickets = computed(() => {
    return tickets.value.filter(t => t.quantity > 0)
})

const totalTickets = computed(() => {
    return tickets.value.reduce((acc, t) => acc + t.quantity, 0)
})

const grandTotal = computed(() => {
    return tickets.value.reduce((acc, t) => acc + ((t.finalPrice || t.basePrice || 0) * t.quantity), 0)
})

const proceedToPayment = () => {
    if (totalTickets.value > 0) {
        currentStep.value = 2
    }
}

const getTicketRules = (ticket) => {
  console.log("ticket types",ticket)
    const rules = []
    if (!ticket || !ticket.finalPrice || !ticket.basePrice) return rules
    
    const diff = ticket.finalPrice - ticket.basePrice
    if (diff === 0) return rules
    
    // Calculate percentage absolute
    const percent = Math.round(Math.abs(diff / ticket.basePrice) * 100)
    
    if (diff < 0) {
        rules.push({ 
            id: 'auto-discount', 
            description: 'Dynamic Savings', 
            discountPercent: percent 
        })
    } else {
        rules.push({ 
            id: 'auto-surge', 
            description: 'High Demand', 
            priceIncreasePercent: percent 
        })
    }
    return rules
}

const priceDiffPercent = (ticket) => {
  if (!ticket || !ticket.finalPrice || !ticket.basePrice) return ''
  const diff = ((ticket.finalPrice - ticket.basePrice) / ticket.basePrice) * 100
  const rounded = Math.abs(Math.round(diff))
  return diff < 0 ? `-${rounded}%` : `+${rounded}%`
}

const initiateBooking = async () => {
  if (totalTickets.value === 0) return
  
  processing.value = true
  try {
    // 1. Create Booking
    const bookingPayload = {
      EventId: eventId,
      Tickets: selectedTickets.value.map(t => ({
          TicketTypeId: t.ticketTypeId,
          Quantity: t.quantity
      }))
    }
    
    const bookingResult = await attendeeService.createBooking(bookingPayload)
    if (!bookingResult || !bookingResult.bookingId) throw new Error("Invalid booking response")
    const bookingId = bookingResult.bookingId
    
    // 2. Init Payment
    const paymentRes = await attendeeService.initPayment(bookingId)
    if (!paymentRes || !paymentRes.checkoutUrl) throw new Error("No checkout URL from payment service")
    
    paymentDetails.value = paymentRes 
    // paymentRes should contain checkoutUrl and paymentReference
    
    // Move to next step to show button
    currentStep.value = 3
    
  } catch (err) {
    console.error("Booking init failed:", err)
    alert("Failed to initiate booking: " + (err.message || 'Unknown error'))
  } finally {
    processing.value = false
  }
}

const verifyPaymentStatus = async () => {
    if (!paymentDetails.value || !paymentDetails.value.paymentReference) return
    
    verifying.value = true
    verificationError.value = ''
    try {
        const txRef = paymentDetails.value.paymentReference
        const response = await attendeeService.verifyPayment(txRef)
        
        // Backend returns Ok(new { Verified = verified })
        // Check for verified true (handle case sensitivity just in case)
        if (response && (response.verified === true || response.Verified === true)) {
            paymentSuccess.value = true
        } else {
            verificationError.value = "Payment not verified yet. Please complete payment and try again."
        }
    } catch (err) {
        console.error(err)
        verificationError.value = "Verification request failed."
    } finally {
        verifying.value = false
    }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(val)
}

const formatDate = (dateString) => {
  if(!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

