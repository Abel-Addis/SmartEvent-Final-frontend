<template>
  <div class="flex min-h-screen bg-background text-foreground">
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="mobileMenuOpen = false" />

    <aside :class="[
      'fixed lg:sticky top-0 h-screen w-64 flex flex-col transition-transform duration-200 z-50 bg-sidebar border-r border-sidebar-border',
      !mobileMenuOpen && '-translate-x-full lg:translate-x-0'
    ]">
      <div class="h-16 px-5 border-b border-sidebar-border flex items-center justify-between">
        <router-link to="/organizer" class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            C
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-sidebar-foreground">Convene</p>
            <p class="text-xs text-muted-foreground">Organizer</p>
          </div>
        </router-link>
        <button class="lg:hidden text-lg text-muted-foreground" @click="mobileMenuOpen = false">✕</button>
      </div>

      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <nav-item to="/organizer" icon="📊" label="Dashboard" />
        <nav-item to="/organizer/create-event" icon="➕" label="Create Event" />
        <nav-item to="/organizer/events" icon="📋" label="My Events" :exact="true" />
        <nav-item to="/organizer/analytics" icon="📈" label="Analytics" />
        <nav-item to="/organizer/gate-persons" icon="🚪" label="Gate Persons" />
        <nav-item to="/organizer/credits" icon="💎" label="Credits" />
        <nav-item to="/organizer/boosts" icon="🚀" label="Boosts" />
        <nav-item to="/organizer/settings" icon="⚙️" label="Settings" />
      </nav>

      <div class="p-4 border-t border-sidebar-border">
        <!-- User Info -->
        <div class="flex items-center gap-3 px-3 py-2 mb-3">
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {{ authStore.user?.fullName?.charAt(0)?.toUpperCase() || 'O' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-sidebar-foreground truncate">
              {{ authStore.user?.fullName || 'Organizer' }}
            </div>
            <div class="text-xs text-muted-foreground truncate">
              {{ authStore.user?.email || 'organizer@convene.com' }}
            </div>
          </div>
        </div>
        
        <!-- Logout Button -->
        <button 
          @click="handleLogout" 
          class="btn-outline w-full py-2 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/30" 
        >
          Logout
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col w-full">
      <header class="sticky top-0 z-30 bg-background border-b border-border">
        <div class="h-16 px-4 sm:px-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button class="lg:hidden p-2 rounded-lg border border-border bg-card hover:bg-accent transition"
              @click="mobileMenuOpen = !mobileMenuOpen">
              <span class="text-lg">☰</span>
            </button>

            <div>
              <p class="text-xs uppercase tracking-wider text-muted-foreground">Organizer</p>
              <h2 class="text-base sm:text-lg font-semibold">
                <slot name="title">Workspace</slot>
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-2">
              <ThemeToggle />
              <router-link to="/organizer/notifications"
                class="relative p-2 rounded-lg border border-border bg-card hover:bg-accent transition">
                <span class="text-lg">🔔</span>
                <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </router-link>
              <router-link to="/organizer/settings"
                class="p-2 rounded-lg border border-border bg-card hover:bg-accent transition">
                <span class="text-lg">⚙️</span>
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      :type="confirmType"
      :confirm-text="confirmButtonText"
      :loading="confirmLoading"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavItem from '../components/NavItem.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { useConfirmation } from '@/composables/useConfirmation'

const mobileMenuOpen = ref(false)
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { showConfirm, confirmTitle, confirmMessage, confirmType, confirmLoading, confirmButtonText, askConfirmation, onConfirm, onCancel } = useConfirmation()

const handleLogout = async () => {
  const confirmed = await askConfirmation({
    title: 'Logout',
    message: 'Are you sure you want to log out?',
    confirmText: 'Logout',
    type: 'warning'
  })
  
  if (confirmed) {
    authStore.logout()
  }
}

// Get unread count from store
const unreadCount = computed(() => notificationStore.unreadCount)

// Fetch notifications on mount
onMounted(() => {
  if (authStore.user) {
    notificationStore.fetchNotifications()
    notificationStore.connect()
  }
})

onUnmounted(() => {
  notificationStore.disconnect()
})
</script>

