import api from "./api";

export const ticketScanService = {
  /**
   * Scan a ticket QR code (Organizer/GatePerson)
   * @param {Object} data - { ticketQrContent, eventId, deviceId, location }
   */
  async scanTicket(data) {
    const response = await api.post("/ticket-scan/scanTicketQr", data);
    return response.data;
  },

  /**
   * Get paginated scan logs for an event (Organizer)
   * @param {string} eventId
   * @param {Object} params - { pageNumber, pageSize, from, to }
   */
  async getEventScanLogs(eventId, params = {}) {
    // Construct query parameters
    const queryParams = new URLSearchParams();

    if (params.pageNumber) queryParams.append("PageNumber", params.pageNumber);
    if (params.pageSize) queryParams.append("PageSize", params.pageSize);
    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);

    const response = await api.get(
      `/ticket-scan/eventScanLogs/${eventId}?${queryParams.toString()}`,
    );
    return response.data;
  },

  /**
   * Get scan summary for an event (Organizer)
   * @param {string} eventId
   */
  async getScanSummary(eventId) {
    const response = await api.get(`/ticket-scan/eventScanSummary/${eventId}`);
    return response.data;
  },

  /**
   * Get scan logs by a specific Gate Person / User ID (Organizer)
   * @param {string} gatePersonId
   */
  async getLogByUserId(gatePersonId) {
    const response = await api.get(`/ticket-scan/getLogByUserId`, {
      params: { gatePersonId },
    });
    return response.data;
  },

  /**
   * Get recent scans for the currently logged in Gate Person
   */
  async getGatePersonRecentScans() {
    const response = await api.get("/ticket-scan/gatePerson/recent-scans");
    return response.data;
  },
};
