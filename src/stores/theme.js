import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to 'light'
  const theme = ref(localStorage.getItem('theme') || 'light')

  // Apply theme class to document
  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  // Initialize theme on load
  applyTheme(theme.value)

  // Watch for theme changes
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  // Toggle function
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    toggleTheme,
    isDark: () => theme.value === 'dark'
  }
})
