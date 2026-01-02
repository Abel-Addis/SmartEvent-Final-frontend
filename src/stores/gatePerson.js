import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { gatePersonService } from "../services/gatePersonService";

export const useGatePersonStore = defineStore("gatePerson", () => {
  // State
  const gatePersons = ref([]);
  const assignmentEvents = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const activeGatePersons = computed(() =>
    gatePersons.value.filter((gp) => gp.isActive)
  );

  const sortedGatePersons = computed(() =>
    [...gatePersons.value].sort((a, b) => a.fullName.localeCompare(b.fullName))
  );

  // Actions
  async function fetchGatePersons() {
    loading.value = true;
    error.value = null;

    try {
      const response = await gatePersonService.getAllGatePersons();
      gatePersons.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch gate persons";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function createGatePerson(data) {
    loading.value = true;
    error.value = null;

    try {
      const response = await gatePersonService.createGatePerson(data);

      // Add to local state
      gatePersons.value.push(response);

      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create gate person";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function updateGatePerson(id, data) {
    loading.value = true;
    error.value = null;

    try {
      const response = await gatePersonService.updateGatePerson(id, data);

      // Update local state
      const index = gatePersons.value.findIndex((gp) => gp.userId === id);
      if (index !== -1) {
        gatePersons.value[index] = response;
      }

      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update gate person";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function deleteGatePerson(id, hardDelete = false) {
    loading.value = true;
    error.value = null;

    try {
      await gatePersonService.deleteGatePerson(id, hardDelete);

      if (hardDelete) {
        // Remove from local state
        gatePersons.value = gatePersons.value.filter((gp) => gp.userId !== id);
      } else {
        // Mark as inactive
        const gatePerson = gatePersons.value.find((gp) => gp.userId === id);
        if (gatePerson) {
          gatePerson.isActive = false;
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete gate person";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function fetchAssignmentEvents() {
    loading.value = true;
    error.value = null;

    try {
      const response = await gatePersonService.getAssignmentEvents();
      assignmentEvents.value = response;
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch assignment events";
      error.value = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    gatePersons,
    assignmentEvents,
    loading,
    error,
    // Getters
    activeGatePersons,
    sortedGatePersons,
    // Actions
    fetchGatePersons,
    fetchAssignmentEvents,
    createGatePerson,
    updateGatePerson,
    deleteGatePerson,
  };
});
