<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-h2 font-bold mb-2">
        My Favorite Events
      </h1>
      <p class="text-muted-foreground">
        {{ favoriteEvents.length }} events saved
      </p>
    </div>

    <div
      v-if="favoriteEvents.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="event in favoriteEvents"
        :key="event.id"
        class="card group cursor-pointer hover:shadow-lg transition-shadow relative"
      >
        <button
          class="absolute top-3 right-3 p-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          @click="removeFavorite(event.id)"
        >
          <span class="text-lg">✕</span>
        </button>
        
        <div class="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-lg mb-4">
          <span class="text-5xl">🎉</span>
        </div>
        
        <h4 class="text-h4 font-semibold mb-1">
          {{ event.title }}
        </h4>
        <p class="text-muted-foreground text-sm mb-3">
          {{ event.description }}
        </p>
        
        <div class="flex items-center justify-between text-sm pt-3 border-t border-border">
          <span class="text-muted-foreground">📅 {{ event.date }}</span>
          <span class="text-primary font-semibold">{{ event.price }}</span>
        </div>
        
        <router-link
          :to="`/dashboard/events/1`"
          class="btn-primary w-full mt-4 py-2 text-center text-sm"
        >
          View Details
        </router-link>
      </div>
    </div>

    <div
      v-else
      class="card text-center py-12"
    >
      <p class="text-4xl mb-4">
        🤍
      </p>
      <h3 class="text-h3 font-bold mb-2">
        No Favorites Yet
      </h3>
      <p class="text-muted-foreground mb-6">
        Save events to quickly access them later
      </p>
      <router-link
        to="/dashboard/events"
        class="btn-primary inline-block px-6 py-2"
      >
        Browse Events
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const favoriteEvents = ref([
  { id: 1, title: 'Summer Music Festival', description: 'Live music from top artists', date: 'Aug 15, 2025', price: 'From $50' },
  { id: 2, title: 'Tech Conference 2025', description: 'Latest in web development', date: 'Sep 20, 2025', price: 'From $100' },
  { id: 3, title: 'Jazz Night', description: 'Smooth jazz performances', date: 'Aug 25, 2025', price: 'From $30' },
])

const removeFavorite = (id) => {
  favoriteEvents.value = favoriteEvents.value.filter(event => event.id !== id)
}
</script>
