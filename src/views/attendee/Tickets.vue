<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-h2 font-bold mb-2">
        My Bookings
      </h1>
      <p class="text-muted-foreground">
        {{ bookings.length }} active bookings
      </p>
    </div>

    <div v-if="loading" class="text-center py-12 text-muted-foreground">
      Loading bookings...
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-12 text-muted-foreground">
      You haven't booked any events yet.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="booking in bookings"
        :key="booking.bookingId"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1">
            <h3 class="text-h4 font-bold">
              {{ booking.eventTitle }}
            </h3>
            <p class="text-muted-foreground text-sm mb-3">
              Booked on {{ formatDate(booking.bookingDate) }}
            </p>
            <div class="flex flex-wrap gap-3">
              <span class="badge text-xs">{{ booking.bookingStatus }}</span>
              <span :class="['badge text-xs', booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                {{ booking.paymentStatus }}
              </span>
              <span class="text-sm font-bold ml-2">{{ formatCurrency(booking.totalAmount) }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 sm:text-right">
            <p class="text-sm text-muted-foreground">
               ID: {{ booking.bookingId.slice(0, 8) }}...
            </p>
            
            <!-- Actions -->
            <div class="flex gap-2 justify-end">
               <a
                 v-if="booking.canPayNow && booking.checkoutUrl"
                 :href="booking.checkoutUrl"
                 class="btn-primary py-1 px-4 text-sm"
               >
                 Pay Now
               </a>
               <button
                 v-if="canCancel(booking)"
                 class="btn-outline py-1 px-3 text-sm text-destructive hover:bg-destructive/10"
                 @click="cancelBooking(booking.bookingId)"
               >
                 Cancel
               </button>
               <router-link
                v-if="booking.paymentStatus === 'Paid'"
                 :to="`/dashboard/events/${booking.eventId}`" 
                 class="btn-outline py-1 px-3 text-sm"
               >
                 View Event
               </router-link>
               <button
                 class="btn-outline py-1 px-3 text-sm"
                 @click="viewDetails(booking)"
               >
                 View Details
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div v-if="selectedBooking" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
        <div class="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-border flex justify-between items-start sticky top-0 bg-background z-10">
                <div>
                    <h2 class="text-xl font-bold">{{ selectedBooking.eventTitle }}</h2>
                    <p class="text-sm text-muted-foreground">Booking ID: {{ selectedBooking.bookingId }}</p>
                </div>
                <button @click="closeDetails" class="text-muted-foreground hover:text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-6 space-y-6">
                <!-- Status Section -->
                <div class="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                        <p class="text-xs text-muted-foreground">Status</p>
                        <p class="font-medium">{{ selectedBooking.bookingStatus }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-muted-foreground">Payment</p>
                        <p class="font-medium" :class="selectedBooking.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'">
                            {{ selectedBooking.paymentStatus }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-muted-foreground">Booking Date</p>
                        <p class="font-medium">{{ formatDate(selectedBooking.bookingDate) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-muted-foreground">Total Amount</p>
                        <p class="font-medium">{{ formatCurrency(selectedBooking.totalAmount) }}</p>
                    </div>
                </div>

                <!-- Tickets Section -->
                <div>
                    <h3 class="text-lg font-semibold mb-3">My Tickets</h3>
                    <div v-if="detailsLoading" class="text-center py-4">Loading tickets...</div>
                    <div v-else-if="selectedTickets.length === 0" class="text-center py-4 text-muted-foreground">No tickets found.</div>
                    <div v-else class="space-y-4">
                        <div v-for="ticket in selectedTickets" :key="ticket.ticketId" class="border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                            <!-- QR Code -->
                            <div class="flex-shrink-0 bg-white p-2 rounded border">
                                <qrcode-vue v-if="ticket.qrCode" :value="ticket.qrCode" :size="120" level="H" />
                                <div v-else class="w-32 h-32 flex items-center justify-center bg-gray-100 text-xs text-gray-400">No QR</div>
                            </div>
                            
                            <!-- Ticket Info -->
                            <div class="flex-1 text-center md:text-left space-y-1">
                                <h4 class="font-bold text-lg">{{ ticket.ticketTypeName }}</h4>
                                <p class="text-sm"><span class="text-muted-foreground">Holder:</span> {{ ticket.holderName }}</p>
                                <p class="text-sm"><span class="text-muted-foreground">Phone:</span> {{ ticket.holderPhone }}</p>
                                <p class="text-sm"><span class="text-muted-foreground">Price:</span> {{ formatCurrency(ticket.price) }}</p>
                                <div class="mt-2">
                                    <span class="badge text-xs bg-muted text-foreground">{{ ticket.status }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-border bg-muted/10 flex justify-end gap-3 sticky bottom-0 z-10">
                <button 
                    v-if="canCancel(selectedBooking)"
                    class="btn-outline text-destructive hover:bg-destructive/10 border-destructive/20"
                    @click="cancelBooking(selectedBooking.bookingId)"
                >
                    Cancel Booking
                </button>
                <a
                 v-if="selectedBooking.canPayNow && selectedBooking.checkoutUrl"
                 :href="selectedBooking.checkoutUrl"
                 class="btn-primary"
               >
                 Complete Payment
               </a>
                <button class="btn-outline" @click="closeDetails">Close</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { attendeeService } from '@/services/attendeeService'
import QrcodeVue from 'qrcode.vue'

const bookings = ref([])
const loading = ref(true)

// Details Modal State
const selectedBooking = ref(null)
const selectedTickets = ref([])
const detailsLoading = ref(false)

onMounted(async () => {
  await fetchBookings()
})

const fetchBookings = async () => {
  loading.value = true
  try {
    const data = await attendeeService.getMyBookings()
    bookings.value = data || []
  } catch (err) {
    console.error("Failed to fetch bookings", err)
  } finally {
    loading.value = false
  }
}

const viewDetails = async (booking) => {
    selectedBooking.value = booking
    detailsLoading.value = true
    selectedTickets.value = [] // Reset
    
    try {
        // Fetch Tickets explicitly as requested
        const tickets = await attendeeService.getTicketsForBooking(booking.bookingId)
        selectedTickets.value = tickets
    } catch (err) {
        console.error("Failed to fetch tickets", err)
    } finally {
        detailsLoading.value = false
    }
}

const closeDetails = () => {
    selectedBooking.value = null
    selectedTickets.value = []
}

const canCancel = (booking) => {
    return booking.bookingStatus !== 'Cancelled' && 
           booking.bookingStatus !== 'Used' && 
           !booking.eventEnded
}

const cancelBooking = async (id) => {
  if(!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return
  
  try {
    await attendeeService.cancelBooking(id)
    alert("Booking cancelled successfully")
    await fetchBookings() // Refresh list
    closeDetails() // Close modal
  } catch (err) {
    alert(err.response?.data?.message || "Failed to cancel booking")
  }
}

const formatDate = (dateString) => {
  if(!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (val) => {
   return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(val)
}
</script>
