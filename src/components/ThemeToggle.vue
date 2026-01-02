<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<template>
    <button @click="themeStore.toggleTheme()"
        class="relative p-2.5 rounded-full hover:bg-secondary/50 transition-all duration-300 group overflow-hidden"
        :aria-label="themeStore.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <!-- Light mode icon (sun) -->
        <div class="absolute inset-0 flex items-center justify-center transition-all duration-500"
            :class="themeStore.theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'">
            <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>

        <!-- Dark mode icon (moon) -->
        <div class="absolute inset-0 flex items-center justify-center transition-all duration-500"
            :class="themeStore.theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'">
            <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </div>

        <!-- Placeholder for sizing -->
        <div class="w-5 h-5 opacity-0"></div>

        <!-- Glow effect on hover -->
        <div
            class="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full">
        </div>
    </button>
</template>
