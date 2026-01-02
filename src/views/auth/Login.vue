<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useForm } from 'vee-validate'
import { loginSchema } from '../../validation/authSchemas'

const router = useRouter()
const authStore = useAuthStore()
const errorMessage = ref('')
const rememberMe = ref(false)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: loginSchema
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const handleLogin = handleSubmit(async (values) => {
  errorMessage.value = ''

  try {
    const result = await authStore.login({
      email: values.email,
      password: values.password,
    })

    if (result.success) {
      const role = result.user.role
      
      if (role === 'SuperAdmin') {
        router.push('/admin')
      } else if (role === 'Organizer') {
        router.push('/organizer')
      } else if (role === 'Attendee') {
        router.push('/dashboard')
      } else if (role === 'GatePerson') {
        router.push('/scanner')
      }
      else {
        router.push('/')
      }
    } else {
      errorMessage.value = result.message || 'Login failed. Please check your credentials.'
    }
  } catch (error) {
    errorMessage.value = 'An error occurred. Please try again.'
    console.error('Login error:', error)
  }
})
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8 space-y-2">
        <span class="section-title justify-center">Vo Access</span>
        <h1 class="text-h2 font-bold">
          Welcome back
        </h1>
        <p class="text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <form class="card space-y-6" @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div v-if="errorMessage"
          class="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email Address</label>
          <input v-model="email" v-bind="emailAttrs" type="email" placeholder="you@example.com" class="input-field w-full"
            :class="{'border-destructive': errors.email}" :disabled="authStore.loading">
          <p v-if="errors.email" class="text-xs text-destructive mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <input v-model="password" v-bind="passwordAttrs" type="password" placeholder="••••••••" class="input-field w-full"
            :class="{'border-destructive': errors.password}" :disabled="authStore.loading">
          <p v-if="errors.password" class="text-xs text-destructive mt-1">{{ errors.password }}</p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2">
            <input v-model="rememberMe" type="checkbox"
              class="rounded border-border text-primary focus:ring-0 focus:ring-offset-0" :disabled="authStore.loading">
            <span>Remember me</span>
          </label>
          <router-link to="/forgot-password" class="text-foreground hover:underline">
            Forgot password?
          </router-link>
        </div>

        <button type="submit" class="btn-primary w-full py-3" :disabled="authStore.loading">
          <span v-if="authStore.loading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>

        <p class="text-center text-sm text-muted-foreground">
          Don't have an account?
          <router-link to="/signup" class="text-foreground hover:underline font-medium">
            Sign up
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>
