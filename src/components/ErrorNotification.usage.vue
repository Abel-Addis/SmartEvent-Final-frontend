<!-- 
  ERROR NOTIFICATION COMPONENT - USAGE GUIDE
  
  This component provides a beautiful, non-intrusive way to display errors
  instead of using alert() dialogs.
-->

<!-- BASIC USAGE EXAMPLE -->
<template>
  <div>
    <!-- Your page content -->
    <button @click="triggerError">Test Error</button>

    <!-- Add the ErrorNotification component -->
    <ErrorNotification
      :show="showError"
      :title="errorTitle"
      :message="errorMessage"
      :detail="errorDetail"
      :status-code="errorStatusCode"
      @close="closeError"
    />
  </div>
</template>

<script setup>
import ErrorNotification from '@/components/ErrorNotification.vue'
import { useErrorNotification } from '@/composables/useErrorNotification'

// Use the composable
const {
  showError,
  errorTitle,
  errorMessage,
  errorDetail,
  errorStatusCode,
  displayError,
  closeError
} = useErrorNotification()

// Example: Handle API error
const fetchData = async () => {
  try {
    const response = await someApiCall()
    // ... handle success
  } catch (err) {
    // Instead of: alert('Error occurred')
    // Use: displayError(err, 'Failed to fetch data')
    displayError(err, 'Failed to fetch data')
  }
}

// Example: Display custom error
const triggerError = () => {
  displayError('This is a custom error message')
}

// Example: Display backend error object
const handleBackendError = () => {
  const backendError = {
    success: false,
    error: "Invalid credentials",
    detail: "The email or password you entered is incorrect",
    statusCode: 401
  }
  displayError(backendError)
}
</script>

<!-- 
  COMPONENT PROPS:
  
  - show: Boolean (required) - Controls visibility
  - title: String (default: 'Error') - Error title
  - message: String (required) - Main error message
  - detail: String (optional) - Additional details
  - statusCode: Number (optional) - HTTP status code
  - autoDismiss: Boolean (default: true) - Auto-close after duration
  - duration: Number (default: 5000) - Duration in milliseconds before auto-close
  
  EVENTS:
  
  - @close - Emitted when error is closed (manually or auto-dismissed)
-->
