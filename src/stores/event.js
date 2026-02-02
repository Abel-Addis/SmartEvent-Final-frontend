import { defineStore } from "pinia";
import { ref } from "vue";
import { eventService } from "../services/eventService";

export const useEventStore = defineStore("event", () => {
  // State
  const currentEvent = ref(null);
  const events = ref([]);
  const categories = ref([]);
  const defaultTicketTypes = ref([]);
  const defaultPricingRules = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  async function createEvent(eventData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.createEvent(eventData);
      currentEvent.value = response;
      return { success: true, event: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create event";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function addTicketType(eventId, ticketData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.addTicketType(eventId, ticketData);
      return { success: true, ticket: response };
    } catch (err) {
      let errorMessage = "Failed to add ticket type";
      if (err.response && err.response.data) {
        // Backend ErrorHandlingMiddleware returns { success, error, detail, statusCode }
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === "string") {
          // Fallback for plain text responses
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          // Fallback for other JSON formats
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function addPricingRule(ticketTypeId, ruleData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.addPricingRule(
        ticketTypeId,
        ruleData,
      );
      return { success: true, rule: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add pricing rule";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function publishEvent(eventId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.publishEvent(eventId);
      if (currentEvent.value && currentEvent.value.id === eventId) {
        currentEvent.value.status = "Published";
      }
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to publish event";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchDefaultTicketTypes() {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.getDefaultTicketTypes();
      defaultTicketTypes.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch ticket types";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchDefaultPricingRules() {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.getDefaultPricingRules();
      defaultPricingRules.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch pricing rules";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrganizerEvents(organizerId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.getOrganizerEvents(organizerId);
      events.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch events";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function postEventToTelegram(eventId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await eventService.postEventToTelegram(eventId);
      return { success: true, message: response };
    } catch (err) {
      let errorMessage = "Failed to post event to Telegram";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentEvent() {
    currentEvent.value = null;
    error.value = null;
  }

  return {
    // State
    currentEvent,
    events,
    categories,
    defaultTicketTypes,
    defaultPricingRules,
    loading,
    error,
    // Actions
    createEvent,
    addTicketType,
    addPricingRule,
    publishEvent,
    fetchDefaultTicketTypes,
    fetchDefaultPricingRules,
    fetchOrganizerEvents,
    postEventToTelegram,
    clearCurrentEvent,
  };
});
