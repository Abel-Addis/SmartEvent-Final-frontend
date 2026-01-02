<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="card">
      <div class="flex flex-col gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search events..."
          class="input-field w-full"
        >
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label class="text-sm font-medium mb-2 block">Category</label>
            <select
              v-model="selectedCategory"
              class="input-field w-full"
            >
              <option value="">
                All Categories
              </option>
              <option value="music">
                Music
              </option>
              <option value="sports">
                Sports
              </option>
              <option value="tech">
                Tech
              </option>
              <option value="business">
                Business
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">Price Range</label>
            <select
              v-model="selectedPrice"
              class="input-field w-full"
            >
              <option value="">
                Any Price
              </option>
              <option value="free">
                Free
              </option>
              <option value="0-50">
                Under $50
              </option>
              <option value="50-100">
                $50 - $100
              </option>
              <option value="100+">
                $100+
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">Date</label>
            <input
              v-model="selectedDate"
              type="date"
              class="input-field w-full"
            >
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">Location</label>
            <input
              v-model="selectedLocation"
              type="text"
              placeholder="City or venue"
              class="input-field w-full"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div>
      <p class="text-sm text-muted-foreground mb-4">
        Showing {{ events.length }} events
      </p>
      
      <div v-if="loading" class="py-12 text-center text-muted-foreground">
         Loading events...
      </div>
      
      <div v-else-if="events.length === 0" class="py-12 text-center text-muted-foreground">
         No events found matching criteria.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <event-card
          v-for="event in events"
          :key="event.eventId"
          :id="event.eventId"
          :title="event.title"
          :image="event.bannerImageUrl"
          :date="formatDate(event.startDate)"
          :price="event.lowestTicketPrice > 0 ? `From ${formatCurrency(event.lowestTicketPrice)}` : 'Free'"
          :location="event.venue"
          :category="event.categoryName"
          :description="event.description || ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import EventCard from '@/components/EventCard.vue'
import { attendeeService } from '@/services/attendeeService'

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedPrice = ref('')
const selectedDate = ref('')
const selectedLocation = ref('')

const events = ref([])
const loading = ref(false)
let debounceTimer = null

onMounted(() => {
  fetchEvents()
})

const fetchEvents = async () => {
  loading.value = true
  try {
    // Parse price range
    let minPrice = null
    let maxPrice = null
    if (selectedPrice.value === 'free') {
       maxPrice = 0
    } else if (selectedPrice.value === '0-50') {
       maxPrice = 50
    } else if (selectedPrice.value === '50-100') {
       minPrice = 50
       maxPrice = 100
    } else if (selectedPrice.value === '100+') {
       minPrice = 100
    }

    const payload = {
      Keyword: searchQuery.value || null,
      CategoryName: selectedCategory.value || null,
      Venue: selectedLocation.value || null,
      StartDateFrom: selectedDate.value ? new Date(selectedDate.value) : null,
      MinPrice: minPrice,
      MaxPrice: maxPrice,
      PageNumber: 1,
      PageSize: 20
    }
    
    // Clean payload
    Object.keys(payload).forEach(key => payload[key] === null && delete payload[key])

    const result = await attendeeService.searchEvents(payload)
    events.value = result.items || []
  } catch (err) {
    console.error("Search failed", err)
  } finally {
    loading.value = false
  }
}

// Watch filters
watch([searchQuery, selectedCategory, selectedPrice, selectedDate, selectedLocation], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchEvents()
  }, 500)
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(val)
}

const formatDate = (dateString) => {
  if(!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
