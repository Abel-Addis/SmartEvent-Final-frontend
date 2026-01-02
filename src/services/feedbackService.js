import apiClient from './api'

export const feedbackService = {
    /**
     * Get list of events eligible for feedback
     * @returns {Promise<Array>} List of eligible events
     */
    async getEligibleEvents() {
        const response = await apiClient.get('/feedback/eligible-for-feedback')
        return response.data
    },

    /**
     * Submit feedback for an event
     * @param {string} eventId
     * @param {Object} payload - { rating: number, comment: string }
     * @returns {Promise<Object>} Created feedback
     */
    async submitFeedback(eventId, payload) {
        const response = await apiClient.post(`/feedback/${eventId}`, payload)
        return response.data
    },

    /**
     * Update existing feedback
     * @param {string} feedbackId
     * @param {Object} payload - { rating: number, comment: string }
     * @returns {Promise<Object>} Updated feedback
     */
    async updateFeedback(feedbackId, payload) {
        const response = await apiClient.put(`/feedback/${feedbackId}`, payload)
        return response.data
    },

    /**
     * Delete feedback
     * @param {string} feedbackId
     * @returns {Promise<Object>} Success message
     */
    async deleteFeedback(feedbackId) {
        const response = await apiClient.delete(`/feedback/${feedbackId}`)
        return response.data
    },

    /**
     * Get user's feedback for a specific event
     * @param {string} eventId
     * @returns {Promise<Object>} Feedback details
     */
    async getMyFeedbackForEvent(eventId) {
        const response = await apiClient.get(`/feedback/getMyfeedback/${eventId}`)
        return response.data
    },

    /**
     * Get feedback history for current user
     * @returns {Promise<Array>} List of user's past feedbacks
     */
    async getMyFeedbackHistory() {
        const response = await apiClient.get('/feedback/myFeedbacks/history')
        return response.data
    },

    /**
     * Get all feedbacks for an organizer
     * @param {string} organizerId
     * @returns {Promise<Array>} List of feedbacks
     */
    async getFeedbacksForOrganizer(organizerId) {
        const response = await apiClient.get(`/feedback/organizersAll-Events-FeedBacks/${organizerId}`)
        return response.data
    },

    /**
     * Get summary of feedbacks for an event (avg rating, count, list)
     * @param {string} eventId 
     */
    async getEventFeedbackSummary(eventId) {
        const response = await apiClient.get(`/feedback/event/${eventId}/summary`)
        return response.data
    },

    /**
     * Get all feedbacks for a specific event
     * @param {string} eventId 
     * @returns {Promise<Array>} List of feedbacks
     */
    async getFeedbacksForEvent(eventId) {
        const response = await apiClient.get(`/feedback/event/${eventId}`)
        return response.data
    }
}
