<template>
  <div class="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(108,111,248,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_25%)]" />
    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8 space-y-2">
        <span class="section-title justify-center">Account Recovery</span>
        <h1 class="text-h2 font-bold">
          Reset your password
        </h1>
        <p class="text-muted-foreground">
          Enter your email to receive password reset instructions
        </p>
      </div>

      <form
        v-if="!emailSent"
        class="card space-y-6 glass"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label class="block text-sm font-medium mb-2">Email Address</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="input-field w-full"
            required
          >
        </div>

        <button
          type="submit"
            class="btn-primary w-full py-3"
        >
          Send Reset Link
        </button>

        <router-link
          to="/login"
          class="block text-center text-primary hover:underline font-medium"
        >
          Back to login
        </router-link>
      </form>

      <div
        v-else
        class="card space-y-6 glass"
      >
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 border border-border">
            <span class="text-3xl text-foreground">✓</span>
          </div>
          <h2 class="text-h4 font-semibold mb-2">
            Email Sent!
          </h2>
          <p class="text-muted-foreground">
            Check your email for password reset instructions.
          </p>
        </div>

        <button
          type="button"
          class="btn-outline w-full py-3"
          @click="emailSent = false"
        >
          Send Another Email
        </button>

        <router-link
          to="/login"
          class="block text-center text-primary hover:underline font-medium"
        >
          Back to login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const emailSent = ref(false)

const handleSubmit = () => {
  console.log('Reset password email sent to:', email.value)
  emailSent.value = true
}
</script>
