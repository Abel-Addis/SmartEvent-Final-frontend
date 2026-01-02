<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <aside class="hidden lg:flex w-64 bg-card border-r border-border flex-col">
      <div class="p-6 border-b border-border">
        <h1 class="text-h4 font-bold text-primary">
          EventHub
        </h1>
      </div>
      <nav class="flex-1 overflow-y-auto p-4 space-y-2">
        <slot name="nav" />
      </nav>
      <div class="p-4 border-t border-border">
        <button class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <span class="text-xl">👤</span>
          <span class="text-sm font-medium">Profile</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Top Header -->
      <header class="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button class="lg:hidden p-2 hover:bg-muted rounded-lg">
            <span class="text-xl">☰</span>
          </button>
          <h2 class="text-h4 hidden sm:block">
            <slot name="title">
              Welcome
            </slot>
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <button class="p-2 hover:bg-muted rounded-lg relative">
            <span class="text-xl">🔔</span>
            <span class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <button class="p-2 hover:bg-muted rounded-lg">
            <span class="text-xl">⚙️</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
</script>
