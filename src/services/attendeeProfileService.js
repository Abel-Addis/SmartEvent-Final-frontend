import apiClient from './api'

export const attendeeProfileService = {
  /**
   * Get attendee profile
   * @returns {Promise} Profile data
   */
  async getProfile() {
    const response = await apiClient.get('/attendee/profile')
    return response.data
  },

  /**
   * Update attendee profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise}
   */
  async updateProfile(profileData) {
    const response = await apiClient.put('/attendee/profile', profileData)
    return response.data
  },

  /**
   * Update profile image
   * @param {File} file - Image file
   * @returns {Promise} New image URL
   */
  async updateProfileImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.put('/attendee/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },
}
