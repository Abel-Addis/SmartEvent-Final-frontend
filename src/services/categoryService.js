import apiClient from './api'

export const categoryService = {
  /**
   * Get all event categories
   * @returns {Promise} List of categories
   */
  async getAllCategories() {
    const response = await apiClient.get('/event-categories/get-all-categories')
    return response.data
  },

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise}
   */
  async getCategoryById(categoryId) {
    const response = await apiClient.get(`/event-category/get-category-by-id/${categoryId}`)
    return response.data
  },

  /**
   * Add a new category
   * @param {{ name: string, description: string }} payload
   */
  async addCategory(payload) {
    const response = await apiClient.post('/event-categories/add-category', payload)
    return response.data
  },

  /**
   * Update a category
   * @param {string} categoryId
   * @param {{ name: string, description: string }} payload
   */
  async updateCategory(categoryId, payload) {
    const query = new URLSearchParams({ CategoryId: categoryId })
    const response = await apiClient.patch(`/event-categories/Update-Category?${query}`, payload)
    return response.data
  },

  /**
   * Delete a category
   * @param {string} categoryId
   */
  async deleteCategory(categoryId) {
    const query = new URLSearchParams({ CategoryId: categoryId })
    const response = await apiClient.delete(`/event-categories/Delete-Category?${query}`)
    return response.data
  },
}
