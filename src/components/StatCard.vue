<template>
  <div class="card hover:shadow-md transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          {{ label }}
        </p>
        <h3 class="text-2xl font-bold text-foreground">
          {{ value }}
        </h3>
      </div>

      <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
        <span class="text-lg">{{ icon }}</span>
      </div>
    </div>

    <div class="flex items-center gap-1.5 text-xs pt-2 border-t border-border/50">
      <div class="flex items-center gap-1 font-medium text-muted-foreground">
        <span class="text-sm">{{ trend > 0 ? '↗' : '↘' }}</span>
        <span>{{ trend > 0 ? '+' : '' }}{{ trend }}%</span>
      </div>
      <span class="text-muted-foreground">vs last month</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
  icon: String,
  trend: {
    type: [String, Number],
    default: 0,
  },
})
</script>
