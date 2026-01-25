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
  <div class="relative min-h-screen flex items-center justify-center bg-[#02040a] px-4 py-10 overflow-hidden text-white font-sans selection:bg-indigo-500/30">
    
    <!-- Ambient Background Effects -->
    <div class="fixed inset-0 z-0 pointer-events-none">
       <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
       <div class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
    </div>

    <div class="w-full max-w-md relative z-10 animate-fade-in-up">
      
      <!-- Brand & Header -->
      <div class="text-center mb-10 space-y-3">
        <router-link to="/" class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform duration-300">
          <span class="font-bold text-xl text-white">C</span>
        </router-link>
        <h1 class="text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p class="text-slate-400">
          Enter your credentials to access your account
        </p>
      </div>

      <!-- Login Card -->
      <div class="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Error Message -->
          <div v-if="errorMessage"
            class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
            <span class="text-lg">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div class="relative group">
              <input v-model="email" v-bind="emailAttrs" type="email" placeholder="name@example.com" 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                :class="{'border-red-500/50 focus:border-red-500 focus:ring-red-500': errors.email}" 
                :disabled="authStore.loading">
            </div>
            <p v-if="errors.email" class="text-xs text-red-400 ml-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
             <div class="flex items-center justify-between ml-1">
              <label class="block text-sm font-medium text-slate-300">Password</label>
            </div>
            <div class="relative">
              <input v-model="password" v-bind="passwordAttrs" type="password" placeholder="••••••••" 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                :class="{'border-red-500/50 focus:border-red-500 focus:ring-red-500': errors.password}" 
                :disabled="authStore.loading">
            </div>
            <p v-if="errors.password" class="text-xs text-red-400 ml-1">{{ errors.password }}</p>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer group">
              <div class="relative flex items-center">
                <input v-model="rememberMe" type="checkbox"
                  class="peer h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-offset-0 focus:ring-indigo-500/50 cursor-pointer transition-all" 
                  :disabled="authStore.loading">
              </div>
              <span class="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
            </label>
            <router-link to="/forgot-password" class="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              Forgot password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Sign In</span>
          </button>

          <!-- Divider -->
          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-white/10"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-[#02040a] px-3 text-slate-500">Or continue with</span>
            </div>
          </div>
           
           <!-- Sign Up Link -->
          <p class="text-center text-sm text-slate-400">
            Don't have an account?
            <router-link to="/signup" class="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">
              Create free account
            </router-link>
          </p>
        </form>
      </div>
       
       <!-- Footer Simple -->
       <div class="mt-8 text-center text-xs text-slate-600">
        &copy; 2025 Convene.
       </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
</style>
