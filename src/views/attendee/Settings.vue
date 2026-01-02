<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-h2 font-bold mb-2">
        Profile Settings
      </h1>
      <p class="text-muted-foreground">
        Manage your account settings and preferences
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center py-12">
      <p class="text-muted-foreground">Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="card bg-destructive/10 border-destructive/20 text-destructive p-4">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="card bg-primary/10 border-primary/20 text-primary p-4">
      {{ successMessage }}
    </div>

    <!-- Profile Content -->
    <div v-if="!loading && profile" class="space-y-6">
      <!-- Profile Picture -->
      <div class="card">
        <h3 class="text-h3 font-bold mb-4">Profile Picture</h3>
        <div class="flex items-center gap-6">
          <div class="relative">
            <div v-if="profile.profileImageUrl" class="w-24 h-24 rounded-full overflow-hidden">
              <img :src="profile.profileImageUrl" alt="Profile" class="w-full h-full object-cover">
            </div>
            <div v-else class="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
              {{ profile.fullName?.charAt(0) || 'A' }}
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload">
          </div>
          <div class="flex-1">
            <button class="btn-outline px-4 py-2" :disabled="uploadingImage" @click="$refs.fileInput.click()">
              {{ uploadingImage ? 'Uploading...' : 'Change Picture' }}
            </button>
            <p class="text-sm text-muted-foreground mt-2">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="card">
        <h3 class="text-h3 font-bold mb-4">Personal Information</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Full Name *</label>
            <input v-model="formData.fullName" type="text" class="input-field w-full" :disabled="saving">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Email (Read-only)</label>
            <input :value="profile.email" type="email" class="input-field w-full bg-muted" disabled>
            <p class="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Phone Number *</label>
            <input v-model="formData.phoneNumber" type="tel" class="input-field w-full" :disabled="saving">
          </div>
        </div>
      </div>

      <!-- Booking Statistics -->
      <div class="card">
        <h3 class="text-h3 font-bold mb-4">Your Activity</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 rounded-lg bg-muted">
            <p class="text-2xl font-bold">{{ profile.totalBookings }}</p>
            <p class="text-sm text-muted-foreground">Total Bookings</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-muted">
            <p class="text-2xl font-bold">{{ profile.confirmedBookings }}</p>
            <p class="text-sm text-muted-foreground">Confirmed</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-muted">
            <p class="text-2xl font-bold">${{ formatNumber(profile.totalAmountSpent) }}</p>
            <p class="text-sm text-muted-foreground">Total Spent</p>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex gap-3">
        <button class="btn-primary px-6 py-3" :disabled="saving" @click="saveProfile">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button class="btn-outline px-6 py-3" :disabled="saving" @click="resetForm">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { attendeeProfileService } from '@/services/attendeeProfileService'

const loading = ref(false)
const saving = ref(false)
const uploadingImage = ref(false)
const error = ref(null)
const successMessage = ref(null)
const profile = ref(null)
const fileInput = ref(null)

const formData = reactive({
  fullName: '',
  phoneNumber: ''
})

// Fetch profile
const fetchProfile = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await attendeeProfileService.getProfile()
    profile.value = data

    // Populate form
    formData.fullName = data.fullName || ''
    formData.phoneNumber = data.phoneNumber || ''
  } catch (err) {
    console.error('Failed to fetch profile:', err)
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Save profile
const saveProfile = async () => {
  saving.value = true
  error.value = null
  successMessage.value = null

  try {
    await attendeeProfileService.updateProfile({
      FullName: formData.fullName,
      PhoneNumber: formData.phoneNumber
    })

    successMessage.value = 'Profile updated successfully!'
    await fetchProfile() // Refresh profile

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Failed to update profile:', err)
    error.value = 'Failed to update profile. Please try again.'
  } finally {
    saving.value = false
  }
}

// Handle image upload
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image size must be less than 5MB'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select a valid image file'
    return
  }

  uploadingImage.value = true
  error.value = null

  try {
    const response = await attendeeProfileService.updateProfileImage(file)
    profile.value.profileImageUrl = response.profileImageUrl
    successMessage.value = 'Profile picture updated successfully!'

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Failed to upload image:', err)
    error.value = 'Failed to upload image. Please try again.'
  } finally {
    uploadingImage.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Reset form
const resetForm = () => {
  if (profile.value) {
    formData.fullName = profile.value.fullName || ''
    formData.phoneNumber = profile.value.phoneNumber || ''
  }
}

// Format number
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Fetch profile on mount
onMounted(() => {
  fetchProfile()
})
</script>
