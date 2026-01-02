<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-h2 font-bold mb-2">
        Event Check-in
      </h1>
      <p class="text-muted-foreground">
        Summer Music Festival - Aug 15, 2025
      </p>
    </div>

    <!-- Check-in Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card">
        <p class="text-muted-foreground text-sm mb-1">
          Checked In
        </p>
        <p class="text-3xl font-bold text-primary">
          {{ checkedIn }}
        </p>
        <p class="text-xs text-muted-foreground mt-2">
          {{ Math.round((checkedIn / totalRegistrations) * 100) }}% of total
        </p>
      </div>
      <div class="card">
        <p class="text-muted-foreground text-sm mb-1">
          Total Expected
        </p>
        <p class="text-3xl font-bold">
          {{ totalRegistrations }}
        </p>
      </div>
      <div class="card">
        <p class="text-muted-foreground text-sm mb-1">
          Pending
        </p>
        <p class="text-3xl font-bold text-warning">
          {{ totalRegistrations - checkedIn }}
        </p>
      </div>
    </div>

    <!-- QR Scanner & Manual Entry -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Scanner Section -->
      <div class="lg:col-span-2 card space-y-4">
        <h3 class="text-h4 font-bold">
          QR Code Scanner
        </h3>
        
        <div class="bg-muted p-8 rounded-lg border-2 border-dashed border-border flex items-center justify-center min-h-64">
          <div class="text-center">
            <p class="text-3xl mb-3">
              📱
            </p>
            <p class="text-muted-foreground mb-2">
              Scan attendee tickets here
            </p>
            <p class="text-xs text-muted-foreground">
              Point camera at QR code
            </p>
          </div>
        </div>

        <div
          v-if="lastScanned"
          class="p-4 bg-muted border border-border rounded-lg"
        >
          <p class="text-sm font-medium text-foreground">
            ✓ {{ lastScanned.name }} checked in successfully
          </p>
        </div>
      </div>

      <!-- Manual Entry -->
      <div class="card space-y-4">
        <h3 class="text-h4 font-bold">
          Manual Entry
        </h3>
        <div>
          <label class="block text-sm font-medium mb-2">Ticket Number</label>
          <input
            v-model="manualTicketNo"
            type="text"
            placeholder="Ticket #"
            class="input-field w-full"
          >
        </div>
        <button
          class="btn-primary w-full py-3"
          @click="checkInManually"
        >
          Check In
        </button>

        <div class="border-t border-border pt-4">
          <h4 class="font-semibold mb-3 text-sm">
            Recent Check-ins
          </h4>
          <div class="space-y-2 text-sm max-h-64 overflow-y-auto">
            <div
              v-for="checkin in recentCheckIns"
              :key="checkin.id"
              class="flex justify-between py-2 border-b border-border last:border-0"
            >
              <span>{{ checkin.name }}</span>
              <span class="text-muted-foreground">{{ checkin.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const checkedIn = ref(1178)
const totalRegistrations = ref(1250)
const manualTicketNo = ref('')
const lastScanned = ref(null)

const recentCheckIns = [
  { id: 1, name: 'John Doe', time: '2:15 PM' },
  { id: 2, name: 'Jane Smith', time: '2:14 PM' },
  { id: 3, name: 'Mike Johnson', time: '2:13 PM' },
  { id: 4, name: 'Sarah Williams', time: '2:12 PM' },
  { id: 5, name: 'Tom Brown', time: '2:10 PM' },
]

const checkInManually = () => {
  if (manualTicketNo.value) {
    checkedIn.value++
    lastScanned.value = { name: `Attendee ${manualTicketNo.value}` }
    manualTicketNo.value = ''
    setTimeout(() => {
      lastScanned.value = null
    }, 3000)
  }
}
</script>
