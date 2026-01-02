import apiClient from "./api";

export const adminService = {
  /**
   * Get pending organizer approvals
   * @param {Object} params - Pagination params {pageNumber, pageSize, sortBy, sortDirection}
   * @returns {Promise} PaginatedResult<OrganizerPendingResponse>
   */
  async getPendingOrganizers(params = {}) {
    const queryParams = new URLSearchParams({
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortDirection && { sortDirection: params.sortDirection }),
    });
    const response = await apiClient.get(
      `/admin/organizers/get-pending?${queryParams}`
    );
    return response.data;
  },

  /**
   * Get all organizers
   * @param {Object} params - Pagination and filter params
   * @returns {Promise} PaginatedResult<UserListResponse>
   */
  async getAllOrganizers(params = {}) {
    const queryParams = new URLSearchParams({
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      ...(params.status && { status: params.status }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortDirection && { sortDirection: params.sortDirection }),
    });
    const response = await apiClient.get(
      `/admin/organizers/get-all?${queryParams}`
    );
    return response.data;
  },

  /**
   * Get organizer details by ID
   * @param {string} id - Organizer ID
   * @returns {Promise} OrganizerDetailResponse
   */
  async getOrganizerById(id) {
    const response = await apiClient.get(`/admin/organizers/get-by-id/${id}`);
    return response.data;
  },

  /**
   * Approve organizer
   * @param {string} id - Organizer ID
   * @param {string} adminNotes - Optional admin notes
   * @returns {Promise} Success message
   */
  async approveOrganizer(id, adminNotes = null) {
    const response = await apiClient.post(`/admin/organizers/approve/${id}`, {
      adminNotes,
    });
    return response.data;
  },

  /**
   * Reject organizer
   * @param {string} id - Organizer ID
   * @param {string} adminNotes - Optional admin notes
   * @returns {Promise} Success message
   */
  async rejectOrganizer(id, adminNotes = null) {
    const response = await apiClient.post(`/admin/organizers/reject/${id}`, {
      adminNotes,
    });
    return response.data;
  },

  /**
   * Get all users
   * @param {Object} params - Pagination and filter params
   * @returns {Promise} PaginatedResult<UserListResponse>
   */
  async getAllUsers(params = {}) {
    const queryParams = new URLSearchParams({
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      ...(params.role && { role: params.role }),
      ...(params.status && { status: params.status }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortDirection && { sortDirection: params.sortDirection }),
    });
    const response = await apiClient.get(`/admin/users/get-all?${queryParams}`);
    return response.data;
  },

  /**
   * Search users
   * @param {Object} searchParams - Search criteria {fullName, email, phoneNumber, role, status}
   * @param {Object} pageParams - Pagination params
   * @returns {Promise} PaginatedResult<UserListResponse>
   */
  async searchUsers(searchParams, pageParams = {}) {
    const queryParams = new URLSearchParams({
      pageNumber: pageParams.pageNumber || 1,
      pageSize: pageParams.pageSize || 10,
      ...(pageParams.sortBy && { sortBy: pageParams.sortBy }),
      ...(pageParams.sortDirection && {
        sortDirection: pageParams.sortDirection,
      }),
    });

    // Add search parameters directly to query string
    if (searchParams.fullName)
      queryParams.append("fullName", searchParams.fullName);
    if (searchParams.email) queryParams.append("email", searchParams.email);
    if (searchParams.phoneNumber)
      queryParams.append("phoneNumber", searchParams.phoneNumber);
    if (searchParams.role) queryParams.append("role", searchParams.role);
    if (searchParams.status) queryParams.append("status", searchParams.status);

    const response = await apiClient.get(`/admin/users/search?${queryParams}`);
    return response.data;
  },

  /**
   * Update user status
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise} AuthResponse
   */
  async updateUserStatus(userId, isActive) {
    const response = await apiClient.post("/admin/users/update-status", {
      userId,
      isActive,
    });
    return response.data;
  },

  /**
   * Get all events
   * @returns {Promise} Array of EventResponseDto
   */
  async getAllEvents() {
    const response = await apiClient.get("/admin/events");
    return response.data;
  },

  /**
   * Platform revenue summary
   * @returns {Promise<PlatformRevenueSummaryDto>}
   */
  async getPlatformRevenue() {
    const response = await apiClient.get(
      "/admin/AdminPlatform/Get-Platform-Revenue"
    );
    return response.data;
  },

  /**
   * Boost analytics
   * @returns {Promise<BoostAnalyticsDto[]>}
   */
  async getBoostAnalytics() {
    const response = await apiClient.get("/admin/AdminPlatform/BoostAnalytics");
    return response.data;
  },

  /**
   * Get platform settings
   * @returns {Promise<{creditPriceETB:number, initialOrganizerCredits:number, eventPublishCost:number}>}
   */
  async getPlatformSettings() {
    const response = await apiClient.get(
      "/admin/AdminPlatform/Get-Platform-Settings"
    );
    return response.data;
  },

  /**
   * Update platform settings
   * @param {{creditPriceETB:number, initialOrganizerCredits:number, eventPublishCost:number}} payload
   */
  async updatePlatformSettings(payload) {
    const response = await apiClient.put(
      "/admin/AdminPlatform/Update-Platform-Settings",
      payload
    );
    return response.data;
  },

  /**
   * Add credit to organizer
   * @param {{ userId:string, credits:number, reason?:string }} payload
   */
  async addCreditToOrganizer(payload) {
    const query = new URLSearchParams({
      UserId: payload.userId,
      Credits: payload.credits,
      ...(payload.reason && { Reason: payload.reason }),
    });
    const response = await apiClient.post(
      `/admin/AdminPlatform/Add-Credit-to-Organizer?${query}`
    );
    return response.data;
  },

  /**
   * Get all boost levels
   * @returns {Promise<BoostLevelDto[]>}
   */
  async getAllBoostLevels() {
    const response = await apiClient.get(
      "/admin/AdminBoost/Get-All-Boost-Levels"
    );
    return response.data;
  },

  /**
   * Update boost level
   * @param {UpdateBoostLevelDto} payload
   */
  async updateBoostLevel(payload) {
    const response = await apiClient.put(
      "/admin/AdminBoost/Update-Boost-Level",
      payload
    );
    return response.data;
  },

  /**
   * Update boost level status
   * @param {string} id - Boost Level ID
   * @param {boolean} isActive
   */
  async setBoostLevelStatus(id, isActive) {
    const response = await apiClient.post(
      `/admin/AdminBoost/BoostLevel-UpdateStatus/${id}?IsActive=${isActive}`
    );
    return response.data;
  },

  /**
   * Get system health
   * @returns {Promise<SystemHealthSnapshot>}
   */
  async getSystemHealth() {
    const response = await apiClient.get("/admin/health/check");
    return response.data;
  },

  /**
   * Get credit transactions
   * @param {Object} filter - { startDate, endDate, transactionType, minAmount, maxAmount }
   * @param {boolean} exportCsv - If true, returns CSV blob
   */
  async getCreditTransactions(filter = {}, exportCsv = false) {
    const query = new URLSearchParams({
      ...(filter.startDate && { startDate: filter.startDate }),
      ...(filter.endDate && { endDate: filter.endDate }),
      ...(filter.transactionType && { transactionType: filter.transactionType }),
      ...(filter.minAmount && { minAmount: filter.minAmount }),
      ...(filter.maxAmount && { maxAmount: filter.maxAmount }),
      export: exportCsv
    }).toString();

    const config = exportCsv ? { responseType: 'blob' } : {};
    const response = await apiClient.get(`/admin/AdminPlatform/get-credit-transactions?${query}`, config);
    return response.data;
  },

  // --- Recommendation ---

  async getRecommendationMetrics() {
    const response = await apiClient.get("/admin/recommend/metrics");
    return response.data;
  },

  async retrainGlobalModel() {
    const response = await apiClient.post("/admin/recommend/retrain");
    return response.data;
  },

  async retrainUserModel(userId) {
    const response = await apiClient.post(`/admin/recommend/retrain/${userId}`);
    return response.data;
  },

  // --- Bookings & Events ---

  async getUserBookings(userId) {
    const response = await apiClient.get(
      `/bookings/get-bookings-by-user/${userId}`
    );
    return response.data;
  },

  async getOrganizerEvents(organizerId) {
    const response = await apiClient.get(
      `/events/get-events-by-organizer/${organizerId}`
    );
    return response.data;
  },

  // --- Notifications ---

  async getAdminNotifications() {
    const response = await apiClient.get("/Notification/user"); // Uses endpoint getting current user's notifs
    return response.data;
  },

  async markNotificationRead(id) {
    const response = await apiClient.post(`/Notification/${id}/read`);
    return response.data;
  },

  async sendTestNotification() {
    const response = await apiClient.post("/Notification/test");
    return response.data;
  },

  /**
   * Send broadcast notification to all users
   * @param {{ title: string, message: string }} payload 
   */
  async sendBroadcast(payload) {
    const response = await apiClient.post("/admin/notifications/broadcast", payload);
    return response.data;
  },

  /**
   * Send notification to specific users
   * @param {{ userIds: string[], title: string, message: string }} payload 
   */
  async sendToUsers(payload) {
    const response = await apiClient.post("/admin/notifications/users", payload);
    return response.data;
  },

  /**
   * Get users for notification selection
   * @param {Object} params - { search: string, category: string }
   */
  async getUsersForNotification(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/notifications/users?${query}`);
    return response.data;
  }
};
