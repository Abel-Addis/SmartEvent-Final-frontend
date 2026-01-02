<template>
  <div class="space-y-3">
    <div class="relative">
      <div id="map" class="w-full h-80 rounded-lg border border-border overflow-hidden"></div>
      <div v-if="!mapReady" class="absolute inset-0 bg-card/80 flex items-center justify-center">
        <p class="text-muted-foreground">Loading map...</p>
      </div>
    </div>

    <div v-if="selectedLocation" class="text-sm space-y-1">
      <p class="text-muted-foreground">
        <span class="font-medium">Selected Location:</span>
      </p>
      <p class="font-mono text-xs bg-muted px-3 py-2 rounded">
        Latitude: {{ selectedLocation.lat.toFixed(6) }}, Longitude: {{ selectedLocation.lng.toFixed(6) }}
      </p>
      <p class="text-xs text-muted-foreground">
        Click on the map to select a different location
      </p>
    </div>
    <div v-else class="text-sm text-muted-foreground">
      Click on the map to select event location
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const mapReady = ref(false)
const selectedLocation = ref(null)
let map = null
let marker = null
let L = null

// Default center (Addis Ababa, Ethiopia)
const defaultCenter = { lat: 9.0320, lng: 38.7469 }

onMounted(async () => {
  await loadLeaflet()
  const userLocation = await getUserLocation()
  initMap(userLocation)
})
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
const getUserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      () => {
        resolve(null) // Permission denied or error
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    )
  })
}


const loadLeaflet = async () => {
  try {
    // Dynamically import Leaflet
    const leaflet = await import('leaflet')
    L = leaflet.default

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
    }
  } catch (error) {
    console.error('Failed to load Leaflet:', error)
  }
}

const initMap = (userLocation = null) => {
  try {
    if (!L) {
      console.error('Leaflet not loaded')
      return
    }

    // Initialize map
    const center = userLocation || defaultCenter

    map = L.map('map').setView([center.lat, center.lng], 16)

    if (userLocation) {
      selectedLocation.value = center
      addMarker(center.lat, center.lng)
      emit('update:modelValue', `${center.lat}|${center.lng}`)
    }


    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Fix for default marker icon issue in Leaflet with bundlers
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    // Parse existing value if provided
    if (props.modelValue) {
      const parts = props.modelValue.split('|')
      if (parts.length === 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        if (!isNaN(lat) && !isNaN(lng)) {
          selectedLocation.value = { lat, lng }
          map.setView([lat, lng], 15)
          addMarker(lat, lng)
        }
      }
    }

    // Handle map clicks
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      selectedLocation.value = { lat, lng }
      addMarker(lat, lng)

      // Emit formatted value as "lat|lng"
      emit('update:modelValue', `${lat}|${lng}`)
    })

    mapReady.value = true

    // Force map to recalculate size after a short delay
    setTimeout(() => {
      if (map) {
        map.invalidateSize()
      }
    }, 100)
  } catch (error) {
    console.error('Failed to initialize map:', error)
  }
}

const addMarker = (lat, lng) => {
  if (!L || !map) return

  // Remove existing marker if any
  if (marker) {
    map.removeLayer(marker)
  }

  // Add new marker
  marker = L.marker([lat, lng]).addTo(map)
  marker.bindPopup(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup()
}
</script>

<style scoped>
/* Ensure map container has proper height */
#map {
  z-index: 0;
}
</style>
