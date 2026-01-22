import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useFavoritesStore = defineStore("favorites", () => {
  // State
  const favoriteEventIds = ref(new Set());

  // Load favorites from localStorage on initialization
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem("favoriteEvents");
      if (stored) {
        const parsed = JSON.parse(stored);
        favoriteEventIds.value = new Set(parsed);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      favoriteEventIds.value = new Set();
    }
  };

  // Save favorites to localStorage
  const saveFavorites = () => {
    try {
      const favArray = Array.from(favoriteEventIds.value);
      localStorage.setItem("favoriteEvents", JSON.stringify(favArray));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  // Getters
  const favoriteCount = computed(() => favoriteEventIds.value.size);

  const isFavorite = (eventId) => {
    return favoriteEventIds.value.has(String(eventId));
  };

  const getFavoriteIds = computed(() => Array.from(favoriteEventIds.value));

  // Actions
  const addFavorite = (eventId) => {
    favoriteEventIds.value.add(String(eventId));
    saveFavorites();
  };

  const removeFavorite = (eventId) => {
    favoriteEventIds.value.delete(String(eventId));
    saveFavorites();
  };

  const toggleFavorite = (eventId) => {
    const id = String(eventId);
    if (favoriteEventIds.value.has(id)) {
      removeFavorite(id);
      return false;
    } else {
      addFavorite(id);
      return true;
    }
  };

  const clearAllFavorites = () => {
    favoriteEventIds.value.clear();
    saveFavorites();
  };

  // Initialize
  loadFavorites();

  return {
    favoriteEventIds,
    favoriteCount,
    isFavorite,
    getFavoriteIds,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
  };
});
