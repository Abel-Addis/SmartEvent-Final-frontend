<template>
  <div class="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8 space-y-2">
        <span class="section-title justify-center">Join Vo</span>
        <h1 class="text-h2 font-bold">
          Create your account
        </h1>
        <p class="text-muted-foreground">
          Discover and host amazing experiences
        </p>
      </div>
      
      <!-- Pending Approval Message -->
      <div v-if="isPendingApproval" class="card text-center py-10">
        <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ⏳
        </div>
        <h2 class="text-h2 mb-2">Registration Submitted</h2>
        <p class="text-muted-foreground mb-6">
          Thank you for registering your organization. Your account is currently pending approval from our administrators.
        </p>
        <p class="text-sm text-muted-foreground mb-4">
          You will receive an email once your account has been reviewed. You are being redirected to the login page...
        </p>
        <div class="animate-pulse h-1 bg-primary/20 rounded w-1/2 mx-auto">
          <div class="h-full bg-primary rounded" style="width: 50%"></div>
        </div>
        <button type="button" class="btn-primary w-full py-3" @click="router.push('/login')">
          Redirect Now
        </button>
      </div>

      <form v-else class="card space-y-6" @submit.prevent="handleSignup">
        <!-- Error Message -->
        <div v-if="errorMessage"
          class="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {{ errorMessage }}
        </div>

        <!-- User Type Selection -->
        <div>
          <label class="block text-sm font-medium mb-3">I am a...</label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button"
              :class="['p-3 rounded-xl font-medium transition-all border', userType === 'attendee' ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-secondary']"
              @click="userType = 'attendee'" :disabled="authStore.loading">
              Attendee
            </button>
            <button type="button"
              :class="['p-3 rounded-xl font-medium transition-all border', userType === 'organizer' ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-secondary']"
              @click="userType = 'organizer'" :disabled="authStore.loading">
              Organizer
            </button>
          </div>
        </div>

        <!-- Common Fields -->
        <div>
          <label class="block text-sm font-medium mb-2">Full Name</label>
          <input v-model="fullName" v-bind="fullNameAttrs" type="text" placeholder="John Doe" class="input-field w-full"
            :class="{'border-destructive': errors.fullName}" :disabled="authStore.loading">
          <p v-if="errors.fullName" class="text-xs text-destructive mt-1">{{ errors.fullName }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email Address</label>
          <input v-model="email" v-bind="emailAttrs" type="email" placeholder="you@example.com" class="input-field w-full"
            :class="{'border-destructive': errors.email}" :disabled="authStore.loading">
          <p v-if="errors.email" class="text-xs text-destructive mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Phone Number</label>
          <input v-model="phoneNumber" v-bind="phoneNumberAttrs" type="tel" placeholder="+1234567890" class="input-field w-full"
            :class="{'border-destructive': errors.phoneNumber}" :disabled="authStore.loading">
          <p v-if="errors.phoneNumber" class="text-xs text-destructive mt-1">{{ errors.phoneNumber }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <input v-model="password" v-bind="passwordAttrs" type="password" placeholder="••••••••" class="input-field w-full"
            :class="{'border-destructive': errors.password}" :disabled="authStore.loading">
           <p v-if="errors.password" class="text-xs text-destructive mt-1">{{ errors.password }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Confirm Password</label>
          <input v-model="confirmPassword" v-bind="confirmPasswordAttrs" type="password" placeholder="••••••••" class="input-field w-full"
            :class="{'border-destructive': errors.confirmPassword}" :disabled="authStore.loading">
          <p v-if="errors.confirmPassword" class="text-xs text-destructive mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Organizer-specific Fields -->
        <template v-if="userType === 'organizer'">
          <div class="pt-4 border-t border-border">
            <h3 class="text-sm font-semibold mb-4">Business Information</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Business Name</label>
                <input v-model="businessName" v-bind="businessNameAttrs" type="text" placeholder="Your Company Name"
                  class="input-field w-full" :class="{'border-destructive': errors.businessName}" :disabled="authStore.loading">
                <p v-if="errors.businessName" class="text-xs text-destructive mt-1">{{ errors.businessName }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Business Email</label>
                <input v-model="businessEmail" v-bind="businessEmailAttrs" type="email" placeholder="business@company.com"
                  class="input-field w-full" :class="{'border-destructive': errors.businessEmail}" :disabled="authStore.loading">
                <p v-if="errors.businessEmail" class="text-xs text-destructive mt-1">{{ errors.businessEmail }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">KYC Document (Front)</label>
                <input type="file" accept="image/*" class="input-field w-full" :disabled="authStore.loading"
                  @change="handleFileChange($event, 'front')" required>
                <p class="text-xs text-muted-foreground mt-1">Upload front side of ID/Passport</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">KYC Document (Back)</label>
                <input type="file" accept="image/*" class="input-field w-full" :disabled="authStore.loading"
                  @change="handleFileChange($event, 'back')" required>
                <p class="text-xs text-muted-foreground mt-1">Upload back side of ID/Passport</p>
              </div>
            </div>
          </div>
        </template>

        <label class="flex items-start gap-2 text-sm">
          <input v-model="agreeTerms" type="checkbox"
            class="mt-1 rounded border-border text-primary focus:ring-0 focus:ring-offset-0"
            :disabled="authStore.loading" required>
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </label>

        <button type="submit" class="btn-primary w-full py-3" :disabled="authStore.loading">
          <span v-if="authStore.loading">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>

        <p class="text-center text-sm text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="text-foreground hover:underline font-medium">
            Sign in
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

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
