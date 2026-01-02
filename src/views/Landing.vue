<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border sticky top-0 z-50 bg-card/80 backdrop-blur">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-h4 font-bold text-primary">
          EventHub
        </h1>
        <div class="flex gap-3">
          <router-link
            to="/login"
            class="btn-outline px-6"
          >
            Login
          </router-link>
          <router-link
            to="/signup"
            class="btn-primary px-6"
          >
            Sign Up
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="max-w-3xl mx-auto text-center space-y-8">
          <h2 class="text-h1">
            Discover Events That Matter
          </h2>

          <p class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            The modern platform for discovering, creating, and attending events. From concerts to conferences, find what moves you.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <router-link
              to="/signup?role=attendee"
              class="btn-primary px-8 py-3 text-lg"
            >
              Discover Events
            </router-link>
            <router-link
              to="/signup?role=organizer"
              class="btn-outline px-8 py-3 text-lg"
            >
              Create Event
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 sm:py-20 lg:py-24 bg-card border-y border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-16">
          <h3 class="text-h2">
            Why Choose EventHub?
          </h3>
          <p class="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to discover, create, and manage unforgettable events.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card">
            <div class="text-5xl mb-4">
              🔍
            </div>
            <h4 class="text-h4 mb-3">
              Discover Events
            </h4>
            <p class="text-muted-foreground">
              Browse thousands of events across music, sports, conferences, and more with powerful filters.
            </p>
          </div>

          <div class="card">
            <div class="text-5xl mb-4">
              🎯
            </div>
            <h4 class="text-h4 mb-3">
              Organize Easily
            </h4>
            <p class="text-muted-foreground">
              Create and manage events with intuitive tools, dynamic pricing, and smart recommendations.
            </p>
          </div>

          <div class="card">
            <div class="text-5xl mb-4">
              🔒
            </div>
            <h4 class="text-h4 mb-3">
              Secure Payments
            </h4>
            <p class="text-muted-foreground">
              Fast, secure payments with multiple options including Telebirr, CBE, and card processing.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 sm:py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-16">
          <h3 class="text-h2">
            Popular Categories
          </h3>
          <p class="text-muted-foreground">
            Find events in your favorite categories
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            v-for="cat in categories"
            :key="cat.name"
            class="card hover:border-accent transition-colors text-center py-8"
          >
            <div class="text-4xl mb-3">
              {{ cat.emoji }}
            </div>
            <h4 class="font-semibold text-foreground">
              {{ cat.name }}
            </h4>
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-20 lg:py-24 bg-primary text-primary-foreground rounded-2xl mx-4 sm:mx-6 lg:mx-8 mb-16 sm:mb-20 lg:mb-24">
      <div class="max-w-3xl mx-auto text-center space-y-6 p-8 sm:p-12">
        <h3 class="text-h2">
          Ready to Get Started?
        </h3>
        <p class="text-lg opacity-90">
          Join thousands of attendees and organizers using EventHub to connect and create amazing experiences.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link
            to="/signup"
            class="btn-secondary px-8 py-3 text-lg font-medium"
          >
            Sign Up Now
          </router-link>
          <router-link
            to="/login"
            class="text-primary-foreground hover:opacity-80 font-medium"
          >
            Already have an account?
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-card border-t border-border py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 class="font-semibold mb-4">
              Product
            </h4>
            <ul class="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Features</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Pricing</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Security</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">
              Company
            </h4>
            <ul class="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >About</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Blog</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Careers</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">
              Legal
            </h4>
            <ul class="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Privacy</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Terms</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Contact</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">
              Follow
            </h4>
            <ul class="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Twitter</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >Instagram</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:text-foreground"
                >LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 EventHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const categories = [
  { name: 'Music', emoji: '🎵' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Business', emoji: '💼' },
  { name: 'Arts', emoji: '🎨' },
  { name: 'Food', emoji: '🍽️' },
]
</script>
