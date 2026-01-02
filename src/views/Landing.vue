<template>
  <div class="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
    
    <!-- Ambient Background Effects -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
      <div class="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
    </div>

    <!-- Floating Navigation -->
    <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div class="mx-auto rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/20">
            V
          </div>
          <span class="font-semibold tracking-tight text-white/90">EventHub</span>
        </div>

        <!-- Desktop Links -->
        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#categories" class="hover:text-white transition-colors">Categories</a>
          <a href="#about" class="hover:text-white transition-colors">About</a>
        </div>

        <div class="flex items-center gap-4">
          <router-link to="/login" class="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
            Log in
          </router-link>
          <router-link to="/signup" class="group relative px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
            Get Started
            <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative z-10 pt-48 pb-32 px-6">
      <div class="max-w-5xl mx-auto text-center relative">
        <!-- Spotlight Gradient -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm animate-fade-in-up">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          The future of event management
        </div>

        <h1 class="text-5xl sm:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-fade-in-up delay-100">
          Discover Events <br />
          <span class="text-white">That Move You.</span>
        </h1>

        <p class="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
          The premium platform for discovering, creating, and experiencing unforgettable events. Seamlessly orchestrated, beautifully designed.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <router-link to="/signup?role=attendee" class="min-w-[160px] px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-600/20">
            Discover Events
          </router-link>
          <router-link to="/signup?role=organizer" class="min-w-[160px] px-8 py-3.5 rounded-full border border-white/10 hover:bg-white/5 text-white font-medium transition-all backdrop-blur-sm">
            Create Event
          </router-link>
        </div>
      </div>
    </section>

    <!-- Bento Grid Features -->
    <section id="features" class="relative z-10 py-32 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-3xl font-bold mb-4">Why EventHub?</h2>
          <p class="text-slate-400 max-w-xl mx-auto">Precision tools for organizers, curated experiences for attendees.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div class="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                ⚡
              </div>
              <h3 class="text-xl font-semibold mb-3">Instant Discovery</h3>
              <p class="text-slate-400 text-sm leading-relaxed">
                Browse thousands of events across music, sports, and tech with AI-powered recommendations tailored to your taste.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden md:col-span-2">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="relative z-10 h-full flex flex-col justify-center items-start">
               <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                🎯
              </div>
              <h3 class="text-xl font-semibold mb-3">World-Class Management Tools</h3>
              <p class="text-slate-400 text-sm leading-relaxed max-w-lg">
                For organizers who demand perfection. Real-time analytics, dynamic pricing rules, and seamless attendee management—all in a unified dashboard.
              </p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden md:col-span-2">
             <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="relative z-10 h-full flex flex-col justify-center items-start">
               <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                 🔒
              </div>
              <h3 class="text-xl font-semibold mb-3">Secure & Flexible Payments</h3>
               <p class="text-slate-400 text-sm leading-relaxed max-w-lg">
                Local and international payment support including Telebirr and CBE. Automated receipts and instant payouts.
              </p>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="relative z-10">
               <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
               📱
              </div>
              <h3 class="text-xl font-semibold mb-3">Mobile First</h3>
              <p class="text-slate-400 text-sm leading-relaxed">
                A native-app feel on the web. Experience fluid animations and intuitive gestures anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section id="categories" class="relative z-10 py-32">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-end justify-between mb-12">
          <div>
            <h2 class="text-3xl font-bold mb-2">Curated Categories</h2>
            <p class="text-slate-400">Explore events that define culture.</p>
          </div>
          <router-link to="/signup" class="text-indigo-400 text-sm hover:text-indigo-300 transition-colors hidden sm:block">View all categories →</router-link>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="cat in categories" :key="cat.name" 
               class="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer text-center">
            <div class="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">{{ cat.emoji }}</div>
            <h4 class="font-medium text-slate-300 group-hover:text-white transition-colors">{{ cat.name }}</h4>
          </div>
        </div>
      </div>
    </section>

    <!-- Minimal CTA -->
    <section class="relative py-32 px-6">
      <div class="max-w-4xl mx-auto relative group">
        <!-- Glow behind CTA -->
        <div class="absolute inset-0 bg-indigo-600/20 blur-[100px] opacity-50 group-hover:opacity-75 transition-opacity" />
        
        <div class="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-12 md:p-20 text-center overflow-hidden">
           <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
           <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <h2 class="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to start?</h2>
          <p class="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join the ecosystem where events become experiences. Sign up today and get started in seconds.</p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <router-link to="/signup" class="min-w-[180px] px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-colors">
              Get Started Now
            </router-link>
            <router-link to="/login" class="min-w-[180px] px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-medium transition-colors">
              Log in
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/5 py-12 relative z-10 bg-[#02040a]">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2">
           <div class="w-6 h-6 rounded bg-white/10 flex items-center justify-center font-bold text-xs text-white">
            V
          </div>
          <span class="text-sm font-medium text-slate-400">© 2025 EventHub</span>
        </div>

        <div class="flex gap-8 text-sm text-slate-500">
          <a href="#" class="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" class="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" class="hover:text-slate-300 transition-colors">Contact</a>
        </div>
        
         <div class="flex gap-4">
             <!-- Social Icons Placeholder - utilizing text for simplicity/performance in this view -->
             <a href="#" class="text-slate-500 hover:text-white transition-colors">Twitter</a>
             <a href="#" class="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
         </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
const categories = [
  { name: 'Music', emoji: '🎵' },
  { name: 'Conference', emoji: '🎙️' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Arts', emoji: '🎨' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Food', emoji: '🍽️' },
]
</script>

<style scoped>
/* Custom animations if Tailwind config doesn't have them */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}
</style>
