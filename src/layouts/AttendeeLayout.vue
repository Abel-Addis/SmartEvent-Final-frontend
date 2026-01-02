<template>
  <div class="relative flex min-h-screen bg-background text-foreground">
    <div
      class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,111,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_25%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.14),transparent_28%)]"
    />

    <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-black/60 lg:hidden" @click="mobileMenuOpen = false" />

    <aside
      :class="[
        'fixed lg:sticky top-0 h-screen w-64 flex flex-col transition-transform duration-200 z-50 glass backdrop-blur-xl border-r border-sidebar-border/80 bg-sidebar',
        !mobileMenuOpen && '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="h-16 px-5 border-b border-sidebar-border flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/30">
            N
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-sidebar-foreground">NerdSpace</p>
            <p class="text-xs text-muted-foreground">Discover</p>
          </div>
        </router-link>
        <button class="lg:hidden text-lg" @click="mobileMenuOpen = false">✕</button>
      </div>

      <nav class="flex-1 overflow-y-auto p-4 space-y-2">
        <nav-item to="/dashboard" icon="🏠" label="Dashboard" />
        <nav-item to="/dashboard/events" icon="🎉" label="Browse Events" />
        <nav-item to="/dashboard/favorites" icon="❤️" label="Favorites" />
        <nav-item to="/dashboard/tickets" icon="🎫" label="My Tickets" />
      </nav>

      <div class="p-4 border-t border-sidebar-border bg-sidebar/70 backdrop-blur">
        <div class="flex items-center gap-3 p-3 rounded-xl glass-muted hover:border-accent transition-colors cursor-pointer group">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-sm font-semibold">
            U
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold truncate text-sidebar-foreground">You</div>
            <div class="text-xs text-muted-foreground truncate">user@nerdspace.com</div>
          </div>
          <button 
            @click="authStore.logout()" 
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:bg-sidebar-accent hover:border-accent text-muted-foreground hover:text-destructive transition-all duration-200 active:scale-[0.98] group backdrop-blur-sm" 
            title="Logout"
          >
            <span class="text-base group-hover:scale-110 transition-transform">🚪</span>
            <span class="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col w-full relative z-10">
      <header class="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div class="h-16 px-4 sm:px-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              class="lg:hidden p-2 rounded-xl border border-border bg-card/70 hover:border-accent transition"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <span class="text-lg">☰</span>
            </button>

            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Feed</p>
              <h2 class="text-base sm:text-lg font-semibold">
                <slot name="title">Welcome back</slot>
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <div class="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search events"
                class="input-field w-56 bg-card/70 pl-10 pr-3"
              >
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">⌕</span>
            </div>

            <div class="flex items-center gap-2 pl-2">
              <div class="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50 border border-border">
                <span class="text-[10px] px-1 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground font-semibold">For you</span>
                <span class="text-xs text-muted-foreground">Personalized</span>
              </div>
              <ThemeToggle />
              <router-link to="/dashboard/notifications" class="relative p-2 rounded-xl border border-border bg-card/60 hover:border-accent transition">
                <span class="text-lg">🔔</span>
                <span v-if="notificationStore.unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full shadow-[0_0_0_4px_rgba(239,68,68,0.2)]" />
              </router-link>
              <router-link to="/dashboard/settings" class="p-2 rounded-xl border border-border bg-card/60 hover:border-accent transition">
                <span class="text-lg">⚙️</span>
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        <router-view v-slot="{ Component }">
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavItem from '@/components/NavItem.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const mobileMenuOpen = ref(false)
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>
