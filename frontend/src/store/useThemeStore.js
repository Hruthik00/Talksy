import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "coffee", // Default theme
      setTheme: (theme) => {
        // Apply theme to document immediately
        document.documentElement.setAttribute("data-theme", theme);
        console.log(`Theme changed to: ${theme}`);
        
        // Update state
        set({ theme });
      },
    }),
    {
      name: "theme-storage", // Storage key
      getStorage: () => localStorage, // Use localStorage
      partialize: (state) => ({ theme: state.theme }), // Only persist the theme
      onRehydrateStorage: () => (state) => {
        // Apply theme when rehydrating from storage
        if (state && state.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
          console.log(`Theme restored from storage: ${state.theme}`);
        }
      },
    }
  )
);
