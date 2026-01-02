<template>
  <div class="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(108,111,248,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_25%)]" />
    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 border border-border">
          <span class="text-3xl">✉️</span>
        </div>
        <h1 class="text-h2 font-bold mb-2">
          Verify Your Email
        </h1>
        <p class="text-muted-foreground">
          We've sent a verification link to your email address
        </p>
      </div>

      <div class="card space-y-6 glass">
        <div class="bg-muted border border-border rounded-lg p-4">
          <p class="text-sm text-foreground">
            A verification email has been sent to <strong>user@example.com</strong>. Please click the link in the email to verify your account.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-3">Or enter verification code</label>
          <div class="flex gap-2">
            <input
              v-for="i in 6"
              :key="i"
              v-model="codeArray[i-1]"
              maxlength="1"
              type="text"
              inputmode="numeric"
              class="input-field w-full text-center text-lg font-semibold"
              @input="handleCodeInput"
            >
          </div>
        </div>

        <button
          class="btn-primary w-full py-3"
          @click="handleVerify"
        >
          Verify Email
        </button>

        <div class="text-center">
          <p class="text-sm text-muted-foreground mb-2">
            Didn't receive the email?
          </p>
          <button
            type="button"
            class="text-primary hover:underline font-medium"
            @click="handleResendEmail"
          >
            Resend verification email
          </button>
        </div>

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

<!-- eslint-disable-next-line vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const codeArray = ref(['', '', '', '', '', ''])

const handleCodeInput = (e) => {
  const input = e.target
  if (input.value && e.data) {
    const nextInput = input.nextElementSibling
    if (nextInput) nextInput.focus()
  }
}

const handleVerify = () => {
  const verificationCode = codeArray.value.join('')
  console.log('Verifying code:', verificationCode)
  router.push('/dashboard')
}

const handleResendEmail = () => {
  console.log('Resending verification email')
}
</script>
