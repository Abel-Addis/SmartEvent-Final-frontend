<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useForm } from 'vee-validate'
import { signupSchema } from '../../validation/authSchemas'
import { compressImage } from '../../utils/imageCompression'

const router = useRouter()
const authStore = useAuthStore()

const userType = ref('attendee')
const agreeTerms = ref(false)
const errorMessage = ref('')
const isPendingApproval = ref(false)

// Vee-Validate
const { handleSubmit, errors, defineField, setFieldValue } = useForm({
  validationSchema: signupSchema,
  initialValues: {
    userType: 'attendee' // Set initial userType context
  }
})

const [fullName, fullNameAttrs] = defineField('fullName')
const [email, emailAttrs] = defineField('email')
const [phoneNumber, phoneNumberAttrs] = defineField('phoneNumber')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')
const [businessName, businessNameAttrs] = defineField('businessName')
const [businessEmail, businessEmailAttrs] = defineField('businessEmail')

const kycFiles = reactive({
  front: null,
  back: null,
})

const handleFileChange = async (event, side) => {
  const file = event.target.files[0]
  if (file) {
    try {
      // Compress image before storing
       const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
       })
       kycFiles[side] = compressedFile
    } catch (error) {
       console.error(`Failed to compress ${side} image:`, error)
       kycFiles[side] = file // Fallback to original
    }
  }
}

const handleSignup = handleSubmit(async (values) => {
  // Clear previous error
  errorMessage.value = ''
  
  // Update schema context for conditional validation (business fields)
  setFieldValue('userType', userType.value)

  // Validate terms agreement (manual check as it's outside basic schema usually or handled via yup too)
  if (!agreeTerms.value) {
    errorMessage.value = 'Please agree to the Terms of Service'
    return
  }

  try {
    let result

    if (userType.value === 'attendee') {
      // Register as Attendee
      result = await authStore.registerAttendee({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
      })
    } else {
      // Register as Organizer with file upload
      // Validate KYC files
      if (!kycFiles.front || !kycFiles.back) {
        errorMessage.value = 'Please upload both KYC documents'
        return
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('FullName', values.fullName)
      formDataToSend.append('Email', values.email)
      formDataToSend.append('PhoneNumber', values.phoneNumber)
      formDataToSend.append('Password', values.password)
      formDataToSend.append('BusinessName', values.businessName)
      formDataToSend.append('BusinessEmail', values.businessEmail)
      formDataToSend.append('KYCFrontImage', kycFiles.front)
      formDataToSend.append('KYCBackImage', kycFiles.back)

      result = await authStore.registerOrganizer(formDataToSend)
    }

    if (result.success) {
      // Redirect based on user role
      const role = result.user.role

      if (userType.value === 'organizer') {
        // Show pending approval message
        isPendingApproval.value = true
        setTimeout(() => {
            router.push('/login')
        }, 10000)
      } else if (role === 'Admin') {
        router.push('/admin')
      } else if (role === 'Attendee') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } else {
      errorMessage.value = result.message || 'Registration failed. Please try again.'
    }
  } catch (error) {
    errorMessage.value = 'An error occurred. Please try again.'
    console.error('Signup error:', error)
  }
})
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center bg-[#02040a] px-4 py-10 overflow-hidden text-white font-sans selection:bg-indigo-500/30">
        
    <!-- Ambient Background Effects -->
    <div class="fixed inset-0 z-0 pointer-events-none">
       <div class="absolute top-[0%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px]" />
    </div>

    <div class="w-full max-w-lg relative z-10 animate-fade-in-up">
      <div class="text-center mb-8 space-y-2">
        <router-link to="/" class="text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4 inline-block">
          ← Back to Home
        </router-link>
        <h1 class="text-3xl font-bold tracking-tight">Create your account</h1>
        <p class="text-slate-400">Join the thousands of people creating experiences</p>
      </div>
      
      <!-- Pending Approval Message -->
      <div v-if="isPendingApproval" class="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl p-8 text-center shadow-2xl">
        <div class="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-indigo-500/10">
          ⏳
        </div>
        <h2 class="text-2xl font-bold mb-3">Registration Submitted</h2>
        <p class="text-slate-300 mb-8 leading-relaxed">
          Thank you for registering your organization. Your account is currently pending approval from our administrators.
          Result will be sent to your email shortly.
        </p>
        <div class="w-full bg-slate-800 rounded-full h-1.5 mb-8 overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full animate-progress" style="width: 100%"></div>
        </div>
        <button type="button" class="w-full py-3.5 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-colors" @click="router.push('/login')">
          Go to Login
        </button>
      </div>

      <div v-else class="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <form class="space-y-6" @submit.prevent="handleSignup">
          <!-- Error Message -->
           <div v-if="errorMessage"
            class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
            <span class="text-lg">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- User Type Selection -->
          <div class="p-1 rounded-2xl bg-white/5 border border-white/5 flex gap-1">
            <button type="button"
              class="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-300"
              :class="userType === 'attendee' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              @click="userType = 'attendee'" :disabled="authStore.loading">
              Attendee
            </button>
            <button type="button"
              class="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-300"
              :class="userType === 'organizer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              @click="userType = 'organizer'" :disabled="authStore.loading">
              Organizer
            </button>
          </div>

          <!-- Common Fields -->
          <div class="space-y-5">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <input v-model="fullName" v-bind="fullNameAttrs" type="text" placeholder="John Doe" 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                :class="{'border-red-500/50': errors.fullName}" :disabled="authStore.loading">
              <p v-if="errors.fullName" class="text-xs text-red-400 ml-1">{{ errors.fullName }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <input v-model="email" v-bind="emailAttrs" type="email" placeholder="you@example.com" 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                :class="{'border-red-500/50': errors.email}" :disabled="authStore.loading">
              <p v-if="errors.email" class="text-xs text-red-400 ml-1">{{ errors.email }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300 ml-1">Phone Number</label>
              <input v-model="phoneNumber" v-bind="phoneNumberAttrs" type="tel" placeholder="+1234567890" 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                :class="{'border-red-500/50': errors.phoneNumber}" :disabled="authStore.loading">
              <p v-if="errors.phoneNumber" class="text-xs text-red-400 ml-1">{{ errors.phoneNumber }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300 ml-1">Password</label>
                <input v-model="password" v-bind="passwordAttrs" type="password" placeholder="••••••••" 
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  :class="{'border-red-500/50': errors.password}" :disabled="authStore.loading">
                <p v-if="errors.password" class="text-xs text-red-400 ml-1">{{ errors.password }}</p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                <input v-model="confirmPassword" v-bind="confirmPasswordAttrs" type="password" placeholder="••••••••" 
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  :class="{'border-red-500/50': errors.confirmPassword}" :disabled="authStore.loading">
                <p v-if="errors.confirmPassword" class="text-xs text-red-400 ml-1">{{ errors.confirmPassword }}</p>
              </div>
            </div>
          </div>

          <!-- Organizer-specific Fields -->
          <div v-if="userType === 'organizer'" class="pt-6 border-t border-white/10 animate-fade-in-up">
            <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
              <span class="text-indigo-400">🏢</span> Business Information
            </h3>

            <div class="space-y-5">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300 ml-1">Business Name</label>
                <input v-model="businessName" v-bind="businessNameAttrs" type="text" placeholder="Your Company Name"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  :class="{'border-red-500/50': errors.businessName}" :disabled="authStore.loading">
                <p v-if="errors.businessName" class="text-xs text-red-400 ml-1">{{ errors.businessName }}</p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300 ml-1">Business Email</label>
                <input v-model="businessEmail" v-bind="businessEmailAttrs" type="email" placeholder="business@company.com"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  :class="{'border-red-500/50': errors.businessEmail}" :disabled="authStore.loading">
                <p v-if="errors.businessEmail" class="text-xs text-red-400 ml-1">{{ errors.businessEmail }}</p>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Helper Component for File Input -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-slate-300 ml-1">KYC (Front)</label>
                  <div class="relative group">
                    <input type="file" accept="image/*" 
                      class="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                      :disabled="authStore.loading"
                      @change="handleFileChange($event, 'front')" required>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-slate-300 ml-1">KYC (Back)</label>
                  <div class="relative group">
                     <input type="file" accept="image/*" 
                      class="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                      :disabled="authStore.loading"
                      @change="handleFileChange($event, 'back')" required>
                  </div>
                </div>
              </div>
              <p class="text-xs text-slate-500 italic">* Upload clear images of ID or Passport</p>

            </div>
          </div>

          <!-- Terms -->
          <label class="flex items-start gap-3 cursor-pointer group pt-2">
            <div class="relative flex items-center pt-0.5">
              <input v-model="agreeTerms" type="checkbox"
                class="peer h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-offset-0 focus:ring-indigo-500/50 cursor-pointer"
                :disabled="authStore.loading" required>
            </div>
            <span class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              I agree to the <a href="#" class="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" class="text-indigo-400 hover:underline">Privacy Policy</a>
            </span>
          </label>

          <button type="submit" class="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Create Account</span>
          </button>

          <p class="text-center text-sm text-slate-400">
            Already have an account?
            <router-link to="/login" class="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">
              Sign in
            </router-link>
          </p>
        </form>
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

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-progress {
  animation: progress 2s infinite linear;
}
</style>
