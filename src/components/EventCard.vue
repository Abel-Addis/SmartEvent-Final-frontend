<template>
  <div 
    class="card group cursor-pointer transition-all duration-200 overflow-hidden relative"
    @click="navigateToDetails"
  >
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
      <div class="h-full w-full bg-gradient-to-br from-accent/10 via-transparent to-primary/10 blur-3xl" />
    </div>

    <!-- Event Image/Icon Section -->
    <div
      class="relative h-40 rounded-2xl flex items-center justify-between mb-4 overflow-hidden border border-border bg-gradient-to-br from-secondary/80 via-card to-muted/60"
    >
      <div class="pl-4 py-3 space-y-2">
        <span class="text-xs uppercase tracking-[0.2em] text-muted-foreground">{{ category || 'Featured' }}</span>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="opacity-70">📅</span>
          <span class="font-semibold text-foreground">{{ date }}</span>
        </div>
      </div>
      <div v-if="!image" class="h-full aspect-square flex items-center justify-center bg-gradient-to-tl from-accent/30 to-primary/20">
        <span class="text-5xl opacity-80 mr-4">🎉</span>
      </div>
      <img v-else :src="image" class="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div class="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
      
      <!-- Boost Badge -->
      <div v-if="boostLevel" class="absolute top-2 right-2 px-2 py-1 bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg border border-amber-400/50 backdrop-blur-sm z-20 flex items-center gap-1">
         <span>🚀</span> {{ boostLevel }}
      </div>
    </div>

    <!-- Content Section -->
    <div class="space-y-3 relative z-10">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="text-h4 font-semibold text-foreground line-clamp-1 tracking-tight">
            {{ title }}
          </h4>
          <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {{ description }}
          </p>
        </div>
        <div class="px-3 py-1.5 rounded-full bg-foreground/10 border border-border text-xs font-semibold text-foreground whitespace-nowrap">
          {{ price }}
        </div>
      </div>

      <!-- Footer Info -->
      <div class="flex items-center justify-between text-xs pt-3 border-t border-border">
        <div class="flex items-center gap-2 text-muted-foreground">
          <span class="w-2 h-2 rounded-full bg-foreground shadow-[0_0_0_4px_var(--glow-1)]" />
          <span class="font-medium">Reserve your spot</span>
        </div>
        <button class="btn-outline px-3 py-1.5 text-xs">Details</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  id: [String, Number],
  title: String,
  description: String,
  date: String,
  price: String,
  image: String,
  location: String,
  category: String,
  boostLevel: String
})

const router = useRouter()

const navigateToDetails = () => {
  if (props.id) {
    router.push(`/dashboard/events/${props.id}`)
  }
}
</script>
