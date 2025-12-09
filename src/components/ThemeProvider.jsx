import { createContext, useContext, useEffect, useState } from "react";
import settingService from "@/services/settingService";
import { toast } from "sonner";

const ThemeProviderContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialTheme = async () => {
      try {
        setIsLoading(true);
        const settings = await settingService.getSettings();
        const initialTheme = settings.theme || 'light';
        setThemeState(initialTheme);
        
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(initialTheme);
      } catch (error) {
        toast.error("Không thể tải cài đặt giao diện.");
        // Fallback to light theme
        const root = window.document.documentElement;
        root.classList.remove("dark");
        root.classList.add("light");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialTheme();
  }, []);

  const setTheme = async (newTheme) => {
    const oldTheme = theme;
    // Optimistic update
    setThemeState(newTheme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);

    try {
      await settingService.updateSettings({ theme: newTheme });
    } catch (error) {
      // Revert on failure
      setThemeState(oldTheme);
      root.classList.remove("light", "dark");
      root.classList.add(oldTheme);
      toast.error("Lỗi khi cập nhật giao diện.");
    }
  };

  const value = {
    theme,
    setTheme,
    isLoading,
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
