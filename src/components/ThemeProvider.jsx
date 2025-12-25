import { createContext, useContext, useEffect, useState } from "react";
import settingService from "@/services/settingService";
import authService from "@/lib/authService";
import { toast } from "sonner";

// Define a type for the theme to ensure consistency
// type Theme = "dark" | "light" | "system";

const ThemeProviderContext = createContext(null);

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "theme" }) {
  const [theme, setTheme] = useState(
    () => (localStorage.getItem(storageKey)) || defaultTheme
  );
  const [isSyncing, setIsSyncing] = useState(true);

  // Effect to apply the theme to the document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Effect to sync theme with server on auth change
  useEffect(() => {
    const syncWithServer = async () => {
      if (authService.isAuthenticated()) {
        try {
          setIsSyncing(true);
          const settings = await settingService.getSettings();
          const serverTheme = settings?.theme || defaultTheme;
          
          if (serverTheme !== theme) {
            setTheme(serverTheme);
            localStorage.setItem(storageKey, serverTheme);
          }
        } catch (error) {
          console.warn("Failed to sync theme with server:", error);
          // Don't show a toast for this, as it's a background process
        } finally {
          setIsSyncing(false);
        }
      } else {
        // If logged out, just use whatever is in localStorage
        const localTheme = (localStorage.getItem(storageKey)) || defaultTheme;
        if (localTheme !== theme) {
          setTheme(localTheme);
        }
        setIsSyncing(false);
      }
    };

    syncWithServer();
    // Adding authService.isAuthenticated() is tricky as it's not a reactive state
    // This will run once on mount. A more robust solution might involve a global auth state.
  }, []);

  const handleSetTheme = async (newTheme) => {
    const oldTheme = theme;

    // Optimistic update
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);

    // If authenticated, sync with the backend
    if (authService.isAuthenticated()) {
      try {
        await settingService.updateSettings({ theme: newTheme });
      } catch (error) {
        // Revert on failure
        setTheme(oldTheme);
        localStorage.setItem(storageKey, oldTheme);
        toast.error("Lỗi khi cập nhật giao diện. Vui lòng thử lại.");
      }
    }
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    isLoading: isSyncing,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
