import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "coffee", // Default theme
      setTheme: (theme) => {
        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);
        // Update state
        set({ theme });
      },
    }),
    {
      name: "theme-storage", // Storage key
      getStorage: () => localStorage, // Use localStorage
      onRehydrateStorage: () => (state) => {
        // Apply theme when rehydrating from storage
        if (state && state.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    }
  )
);
