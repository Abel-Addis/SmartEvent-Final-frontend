import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { creditService } from "../services/creditService";

export const useCreditStore = defineStore("credit", () => {
  // State
  const balance = ref(0);
  const purchaseInfo = ref(null); // { creditPriceETB, eventPublishCost, message }
  const transactions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const currentBalance = computed(() => balance.value);

  const creditPriceETB = computed(
    () => purchaseInfo.value?.creditPriceETB || 0
  );

  const eventPublishCost = computed(
    () => purchaseInfo.value?.eventPublishCost || 0
  );

  const sortedTransactions = computed(() =>
    [...transactions.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  );

  // Actions
  async function fetchBalance() {
    loading.value = true;
    error.value = null;

    try {
      const response = await creditService.getBalance();
      balance.value = response.balance;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch balance";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchPurchaseInfo() {
    loading.value = true;
    error.value = null;

    try {
      const response = await creditService.getPurchaseInfo();
      purchaseInfo.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch purchase info";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function purchaseCredits(credits) {
    loading.value = true;
    error.value = null;

    try {
      const response = await creditService.buyCredits(credits);

      // Refresh balance and transactions after purchase
      await fetchBalance();
      await fetchTransactions();

      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to purchase credits";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchTransactions() {
    loading.value = true;
    error.value = null;

    try {
      const response = await creditService.getTransactions();
      transactions.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch transactions";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    balance,
    purchaseInfo,
    transactions,
    loading,
    error,
    // Getters
    currentBalance,
    creditPriceETB,
    eventPublishCost,
    sortedTransactions,
    // Actions
    fetchBalance,
    fetchPurchaseInfo,
    purchaseCredits,
    fetchTransactions,
  };
});
