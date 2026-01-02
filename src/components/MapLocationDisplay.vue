<template>
    <div class="space-y-3">
        <div class="relative">
            <div id="location-map" class="w-full h-96 rounded-lg border border-border overflow-hidden"></div>
            <div v-if="!mapReady" class="absolute inset-0 bg-card/80 flex items-center justify-center">
                <p class="text-muted-foreground">Loading map...</p>
            </div>
        </div>

        <div v-if="coordinates" class="text-sm bg-muted/30 px-4 py-3 rounded-lg">
            <p class="font-medium mb-1">📍 Event Location</p>
            <p class="text-muted-foreground">
                Coordinates: {{ coordinates.lat.toFixed(4) }}, {{ coordinates.lng.toFixed(4) }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
    location: {
        type: String,
        default: ''
    },
    venue: {
        type: String,
        default: ''
    }
})

const mapReady = ref(false)
const coordinates = ref(null)
let map = null
let marker = null
let L = null

onMounted(async () => {
    await loadLeaflet()
    initMap()
})

onUnmounted(() => {
    if (map) {
        map.remove()
        map = null
    }
})

watch(() => props.location, () => {
    if (map && L) {
        updateMapLocation()
    }
})

const loadLeaflet = async () => {
    try {
        const leaflet = await import('leaflet')
        L = leaflet.default

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

const initMap = () => {
    try {
        if (!L) {
            console.error('Leaflet not loaded')
            return
        }

        // Parse location coordinates
        const coords = parseLocation(props.location)
        coordinates.value = coords

        // Initialize map
        map = L.map('location-map', {
            scrollWheelZoom: false,
            dragging: true,
            zoomControl: true
        }).setView([coords.lat, coords.lng], 15)

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map)

        // Fix marker icons
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        // Add marker
        marker = L.marker([coords.lat, coords.lng]).addTo(map)

        if (props.venue) {
            marker.bindPopup(`<strong>${props.venue}</strong>`).openPopup()
        }

        mapReady.value = true

        setTimeout(() => {
            if (map) {
                map.invalidateSize()
            }
        }, 100)
    } catch (error) {
        console.error('Failed to initialize map:', error)
    }
}

const parseLocation = (location) => {
    // Default to Addis Ababa if no location
    const defaultCoords = { lat: 9.0320, lng: 38.7469 }

    if (!location) return defaultCoords

    const parts = location.split('|')
    if (parts.length === 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng }
        }
    }

    return defaultCoords
}

const updateMapLocation = () => {
    const coords = parseLocation(props.location)
    coordinates.value = coords

    if (map && marker) {
        map.setView([coords.lat, coords.lng], 15)
        marker.setLatLng([coords.lat, coords.lng])

        if (props.venue) {
            marker.bindPopup(`<strong>${props.venue}</strong>`).openPopup()
        }
    }
}
</script>

<style scoped>
#location-map {
    z-index: 0;
}
</style>
