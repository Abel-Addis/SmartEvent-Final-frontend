import apiClient from './api'

export const boostService = {
    /**
     * Get all active boost levels
     * @returns {Promise<Array>} List of boost levels
     */
    async getBoostLevels() {
        const response = await apiClient.get('/EventBoost/Levels')
        return response.data
    },

    /**
     * Apply a boost to an event
     * @param {Object} payload - { eventId, boostLevelId }
     * @returns {Promise<Object>} Result with Success, Message, etc.
     */
    async applyBoost(payload) {
        const response = await apiClient.post('/EventBoost/Apply', payload)
        return response.data
    },

    /**
     * Get all boosts applied by the logged-in organizer
     * @returns {Promise<Array>} List of applied boosts
     */
    async getMyBoosts() {
        const response = await apiClient.get('/EventBoost/MyBoosts')
        return response.data
    }
}
