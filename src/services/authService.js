import apiClient from './api'

export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with token and user data
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Register attendee
   * @param {Object} userData - Registration data
   * @returns {Promise} Response with token and user data
   */
  async registerAttendee(userData) {
    const response = await apiClient.post('/auth/register-Attendee', userData)
    return response.data
  },

  /**
   * Register organizer
   * @param {FormData} formData - Organizer registration data with files
   * @returns {Promise} Response with token and user data
   */
  async registerOrganizer(formData) {
    const response = await apiClient.post('/auth/register-organizer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Send OTP for password reset
   * @param {Object} data - { email }
   * @returns {Promise}
   */
  async sendOtp(data) {
    const response = await apiClient.post('/auth/send-otp', data)
    return response.data
  },

  /**
   * Verify OTP
   * @param {Object} data - { email, otp }
   * @returns {Promise}
   */
  async verifyOtp(data) {
    const response = await apiClient.post('/auth/verify-otp', data)
    return response.data
  },

  /**
   * Reset password
   * @param {Object} data - { email, otp, newPassword }
   * @returns {Promise}
   */
  async resetPassword(data) {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  },
}
