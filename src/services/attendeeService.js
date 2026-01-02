import apiClient from "./api";

export const attendeeService = {
  // --- Event Browsing ---

  async getActiveEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await apiClient.get(`/EventBrowsing/activeEvents?${query}`);
    return result.data;
  },

  async getUpcomingEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const result = await apiClient.get(
      `/EventBrowsing/upcomingEvents?${query}`
    );
    return result.data;
  },

  async getRecommendations() {
    const result = await apiClient.get('/recommend/getRecommendationForUser');
    return result.data;
  },

  async getEventDetails(eventId) {
    const result = await apiClient.get(`/EventBrowsing/detailEvent/${eventId}`);
    return result.data;
  },

  async searchEvents(searchPayload) {
    const result = await apiClient.post(
      `/EventBrowsing/Eventsearch`,
      searchPayload
    );
    return result.data;
  },

  // --- Booking ---

  async createBooking(bookingPayload) {
    const result = await apiClient.post(
      `/bookings/create-booking`,
      bookingPayload
    );
    return result.data;
  },

  async getMyBookings() {
    const result = await apiClient.get(`/bookings/my`);
    return result.data;
  },

  async getBookingById(bookingId) {
    const result = await apiClient.get(
      `/bookings/get-booking-by-id/${bookingId}`
    );
    return result.data;
  },

  async cancelBooking(bookingId) {
    const result = await apiClient.put(`/bookings/cancel/${bookingId}`);
    return result.data;
  },

  async getTicketsForBooking(bookingId) {
    const result = await apiClient.get(`/bookings/tickets/${bookingId}`);
    return result.data;
  },

  // --- Payment ---

  async initPayment(bookingId) {
    const result = await apiClient.post(`/Payment/init`, {
      BookingId: bookingId,
    });
    return result.data;
  },

  // Optional: Verify payment manually if needed (Backend usually handles via webhook)
  async verifyPayment(txRef) {
    const result = await apiClient.post(`/Payment/callback`, { tx_ref: txRef });
    return result.data;
  },

  // --- Location Tracking ---

  async trackLocation(location) {
    const result = await apiClient.post(`/track/location`, {
      UserLocation: location,
    });
    return result.data;
  },
};
