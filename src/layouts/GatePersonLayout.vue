<template>
    <div class="relative flex min-h-screen bg-background text-foreground">
        <div
            class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,111,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_25%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.14),transparent_28%)]" />

        <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-black/60 lg:hidden" @click="mobileMenuOpen = false" />
        <aside :class="[
            'fixed lg:sticky top-0 h-screen w-64 flex flex-col transition-transform duration-200 z-50 glass backdrop-blur-xl border-r border-sidebar-border/80 bg-sidebar',
            !mobileMenuOpen && '-translate-x-full lg:translate-x-0'
        ]">
            <div class="h-16 px-5 border-b border-sidebar-border flex items-center justify-between">
                <router-link to="/" class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/30">
                        C
                    </div>
                    <div class="leading-tight">
                        <p class="text-sm font-semibold text-sidebar-foreground">Convene</p>
                        <p class="text-xs text-muted-foreground">Scanner</p>
                    </div>
                </router-link>
                <button class="lg:hidden text-lg" @click="mobileMenuOpen = false">✕</button>
            </div>

            <nav class="flex-1 overflow-y-auto p-4 space-y-2">
                <nav-item to="/scanner" icon="📱" label="Scanner Dashboard" />
            </nav>

            <div class="p-4 border-t border-sidebar-border bg-sidebar/70 backdrop-blur">
                <!-- User Info -->
                <div class="flex items-center gap-3 px-3 py-2 mb-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                        {{ userInitial }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-sidebar-foreground truncate">
                            {{ userInfo?.fullName || 'Gate Person' }}
                        </div>
                        <div class="text-xs text-muted-foreground truncate">
                            {{ userInfo?.email || 'scanner@convene.com' }}
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

        <main class="flex-1 flex flex-col w-full relative z-10">
            <header class="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
                <div class="h-16 px-4 sm:px-6 flex items-center justify-between">
                    <div class="flex items-center gap-3">

                        <button
                            class="lg:hidden p-2 rounded-xl border border-border bg-card/70 hover:border-accent transition"
                            @click="mobileMenuOpen = !mobileMenuOpen">
                            <span class="text-lg">☰</span>
                        </button>

                        <div>
                            <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Gate Scanner</p>
                            <h2 class="text-base sm:text-lg font-semibold">
                                {{ userInfo?.fullName || 'Scanner Dashboard' }}
                            </h2>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <ThemeToggle />
                        <div
                            class="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium">
                            <span class="text-muted-foreground">Organizer:</span> <span class="text-primary">{{
                                userInfo?.organizerName || 'N/A' }}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div class="flex-1 overflow-y-auto">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <router-view />
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { gatePersonService } from '../services/gatePersonService'
import NavItem from '../components/NavItem.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const userInfo = ref(null)
const mobileMenuOpen = ref(false)

const userInitial = computed(() => {
    return userInfo.value?.fullName?.charAt(0).toUpperCase() || 'G'
})

onMounted(async () => {
    try {
        const data = await gatePersonService.getDashboardInfo()
        userInfo.value = data
    } catch (error) {
        console.error('Failed to load user info:', error)
    }
})

const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    router.push('/login')
}
</script>
