import apiClient from "./api";

export const creditService = {
  /**
   * Get current credit balance
   * @returns {Promise} Response with { balance: number }
   */
  async getBalance() {
    const response = await apiClient.get("/organizer-credit/balance");
    return response.data;
  },

  /**
   * Get credit purchase information (pricing)
   * @returns {Promise} Response with BuyCreditInfoDto { creditPriceETB, eventPublishCost, message }
   */
  async getPurchaseInfo() {
    const response = await apiClient.get("/organizer-credit/purchase-info");
    return response.data;
  },

  /**
   * Purchase credits
   * @param {number} credits - Number of credits to purchase
   * @returns {Promise} Response with CreditPurchaseResponseDto
   */
  async buyCredits(credits) {
    const response = await apiClient.post(
      `/organizer-credit/buy?credits=${credits}`
    );
    return response.data;
  },

  /**
   * Get credit transaction history
   * @returns {Promise} Response with array of CreditTransaction objects
   */
  async getTransactions() {
    const response = await apiClient.get("/organizer-credit/transactions");
    return response.data;
  },

  /**
   * Initialize credit payment with Chapa
   * @param {string} creditTransactionId - The credit transaction ID (Guid)
   * @returns {Promise} Response with PaymentResultDto { paymentId, checkoutUrl, paymentReference, status }
   */
  async initializePayment(creditTransactionId) {
    const response = await apiClient.post(
      `/Payment/credit/initialize?creditTransactionId=${creditTransactionId}`
    );
    return response.data;
  },

  /**
   * Verify payment callback from Chapa
   * @param {string} txRef - Transaction reference from Chapa callback
   * @returns {Promise} Response with payment verification result
   */
  async verifyPayment(txRef) {
    const response = await apiClient.get(
      `/Payment/credit/callback?tx_ref=${txRef}`
    );
    return response.data;
  },
};
