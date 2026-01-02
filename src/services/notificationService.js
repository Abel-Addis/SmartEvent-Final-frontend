import apiClient from './api'

export const notificationService = {
  /**
   * Send notification to all attendees of an event
   * @param {Object} payload - { eventId: string, title: string, message: string }
   * @returns {Promise}
   */
  async sendEventNotification(payload) {
    const response = await apiClient.post('/organizer/notifications/event', payload)
    return response.data
  },

  /**
   * Get current user's notifications
   * @returns {Promise<Array>}
   */
  async getUserNotifications() {
    const response = await apiClient.get('/Notification/user')
    return response.data
  },

  /**
   * Mark notification as read
   * @param {string} id 
   */
  async markAsRead(id) {
    await apiClient.post(`/Notification/${id}/read`)
  }
}
