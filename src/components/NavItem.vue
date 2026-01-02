<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  to: String,
  icon: String,
  label: {
    type: String,
    default: 'Label',
  },
  exact: {
    type: Boolean,
    default: false,
  },
})

const isActive = computed(() => {
  // If exact prop is true, match exactly
  if (props.exact) {
    return route.path === props.to
  }
  // Otherwise use startsWith for parent routes
  return route.path.startsWith(props.to)
})
</script>

<template>
  <router-link :to="to"
    class="group flex items-center gap-3 my-3 px-3 py-1 rounded-xl text-sm font-medium transition-all duration-200"
    :class="[
      isActive
        ? 'bg-foreground/90 text-background shadow-sm'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    ]">
    <span class="text-lg shrink-0">{{ icon }}</span>
    <span class="flex-1">{{ label }}</span>
  </router-link>
</template>
