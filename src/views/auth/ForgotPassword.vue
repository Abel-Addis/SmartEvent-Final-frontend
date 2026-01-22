<template>
  <div class="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
    <!-- Ambient Background -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(108,111,248,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_25%)]" />
    
    <!-- Theme Toggle -->
    <div class="absolute top-4 right-4 z-20">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8 space-y-2">
        <span class="section-title justify-center">Account Recovery</span>
        <h1 class="text-h2 font-bold">
          {{ stepTitle }}
        </h1>
        <p class="text-muted-foreground">
          {{ stepSubtitle }}
        </p>
      </div>

      <!-- Error/Success Alerts -->
      <transition name="fade">
        <div v-if="error" class="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <span class="text-lg">⚠️</span>
          {{ error }}
        </div>
      </transition>

      <!-- Step 1: Request OTP -->
      <form
        v-if="currentStep === 'request'"
        class="card space-y-6 glass shadow-2xl"
        @submit.prevent="handleSendOtp"
      >
        <div class="space-y-2">
          <label class="block text-sm font-medium">Email Address</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="input-field w-full"
            required
            :disabled="loading"
          >
          <p class="text-xs text-muted-foreground">
            We'll send a 6-digit verification code to this address.
          </p>
        </div>

        <button
          type="submit"
          class="btn-primary w-full py-3 flex items-center justify-center gap-2 group"
          :disabled="loading"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>{{ loading ? 'Sending...' : 'Send Verification Code' }}</span>
          <span v-if="!loading" class="group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <router-link
          to="/login"
          class="block text-center text-primary hover:underline font-medium text-sm"
        >
          Back to Login
        </router-link>
      </form>

      <!-- Step 2: Verify OTP -->
      <form
        v-else-if="currentStep === 'verify'"
        class="card space-y-6 glass shadow-2xl"
        @submit.prevent="handleVerifyOtp"
      >
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <label class="block text-sm font-medium">Verification Code</label>
            <button 
              type="button" 
              @click="handleSendOtp" 
              class="text-xs text-primary hover:underline"
              :disabled="loading"
            >
              Resend Code
            </button>
          </div>
          <input
            v-model="otpCode"
            type="text"
            maxlength="6"
            placeholder="000000"
            class="input-field w-full text-center text-3xl font-bold tracking-[0.5em] h-16"
            required
            :disabled="loading"
            autocomplete="one-time-code"
          >
          <p class="text-xs text-center text-muted-foreground">
            Enter the 6-digit code sent to <b>{{ email }}</b>
          </p>
        </div>

        <button
          type="submit"
          class="btn-primary w-full py-3"
          :disabled="loading"
        >
          {{ loading ? 'Verifying...' : 'Verify Code' }}
        </button>

        <button
          type="button"
          @click="currentStep = 'request'; error = null"
          class="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          :disabled="loading"
        >
          ← Change Email
        </button>
      </form>

      <!-- Step 3: Reset Password -->
      <form
        v-else-if="currentStep === 'reset'"
        class="card space-y-6 glass shadow-2xl"
        @submit.prevent="handleResetPassword"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1.5">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              class="input-field w-full"
              required
              minlength="6"
              :disabled="loading"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="input-field w-full"
              required
              minlength="6"
              :disabled="loading"
            >
          </div>
        </div>

        <button
          type="submit"
          class="btn-primary w-full py-3"
          :disabled="loading"
        >
          {{ loading ? 'Resetting...' : 'Update Password' }}
        </button>
      </form>

      <!-- Success State -->
      <div
        v-else-if="currentStep === 'success'"
        class="card space-y-6 glass shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div class="text-center space-y-4">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary animate-bounce">
            <span class="text-4xl">🎉</span>
          </div>
          <div>
            <h2 class="text-h4 font-bold">Successfully Reset!</h2>
            <p class="text-muted-foreground">
              Your password has been updated. You can now use your new credentials to access your account.
            </p>
          </div>
        </div>

        <router-link
          to="/login"
          class="btn-primary w-full py-3 text-center block no-underline"
        >
          Sign In Now
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import ThemeToggle from '@/components/ThemeToggle.vue'

// Logic State
const currentStep = ref('request') // request, verify, reset, success
const email = ref('')
const otpCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref(null)

// UI Dynamic Text
const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 'request': return 'Reset Your Password'
    case 'verify': return 'Verify Your Identity'
    case 'reset': return 'Secure Your Account'
    case 'success': return 'All Set!'
    default: return 'Account Recovery'
  }
})

const stepSubtitle = computed(() => {
  switch (currentStep.value) {
    case 'request': return 'Enter your email to receive a recovery code'
    case 'verify': return "We've sent a 6-digit code to your inbox"
    case 'reset': return 'Enter your new password below'
    case 'success': return 'Your password has been changed'
    default: return ''
  }
})

// Actions
const handleSendOtp = async () => {
  if (!email.value) return
  
  loading.value = true
  error.value = null
  
  try {
    await authService.sendOtp({ email: email.value })
    currentStep.value = 'verify'
  } catch (err) {
    error.value = err.response?.data?.message || 'We couldn\'t find an account with that email.'
  } finally {
    loading.value = false
  }
}

const handleVerifyOtp = async () => {
  if (!otpCode.value || otpCode.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit code.'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    await authService.verifyOtp({ 
      email: email.value, 
      otpCode: otpCode.value 
    })
    currentStep.value = 'reset'
  } catch (err) {
    error.value = err.response?.data?.message || 'The code you entered is incorrect or expired.'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match. Please check again.'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    // Note: The backend backend ResetPasswordDto takes Email and NewPassword.
    // OTP verification was done in Step 2.
    await authService.resetPassword({ 
      email: email.value, 
      newPassword: newPassword.value 
    })
    currentStep.value = 'success'
  } catch (err) {
    error.value = err.response?.data?.message || 'Something went wrong while updating your password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.glass {
  background: hsla(var(--background-hsl), 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid hsla(var(--border-hsl), 0.5);
}
</style>
