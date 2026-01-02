import apiClient from './api'

export const organizerService = {
  /**
   * Get organizer's dashboard events
   * @returns {Promise} List of events
   */
  async getDashboardEvents() {
    const response = await apiClient.get('/organizer/dashboard/my-events')
    return response.data
  },

  /**
   * Get organizer's analytics overview
   * @returns {Promise} Overview analytics data
   */
  async getAnalyticsOverview() {
    const response = await apiClient.get('/organizer/analytics/overview')
    return response.data
  },

  /**
   * Get analytics for all events
   * @returns {Promise} List of events with analytics
   */
  async getAnalyticsEvents() {
    const response = await apiClient.get('/organizer/analytics/events')
    return response.data
  },

  /**
   * Get detailed analytics for a specific event
   * @param {string} eventId - Event ID
   * @returns {Promise} Event analytics data
   */
  async getEventAnalytics(eventId) {
    const response = await apiClient.get(`/organizer/analytics/event/${eventId}`)
    return response.data
  },

  /**
   * Get booked users for an event
   * @param {string} eventId - Event ID
   * @param {Object} filters - Optional filters (startDate, endDate, ticketTypeId)
   * @returns {Promise} List of booked users
   */
  async getBookedUsers(eventId, filters = {}) {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.ticketTypeId) params.append('ticketTypeId', filters.ticketTypeId)
    
    const queryString = params.toString()
    const url = `/organizer/analytics/event/${eventId}/booked-users${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(url)
    return response.data
  },

  /**
   * Export booked users to file
   * @param {string} eventId - Event ID
   * @param {Object} filters - Optional filters (startDate, endDate, ticketTypeId, format)
   * @returns {Promise} File blob
   */
  async exportBookedUsers(eventId, filters = {}) {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.ticketTypeId) params.append('ticketTypeId', filters.ticketTypeId)
    params.append('format', filters.format || 'csv')
    
    const queryString = params.toString()
    const url = `/organizer/analytics/${eventId}/booked-users/export?${queryString}`
    const response = await apiClient.get(url, { responseType: 'blob' })
    return response.data
  },
}
