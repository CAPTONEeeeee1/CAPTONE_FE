import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        // Lấy theme từ localStorage hoặc mặc định là 'light'
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light";
        }
        return "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Xóa class cũ
        root.classList.remove("light", "dark");

        // Thêm class mới
        root.classList.add(theme);

        // Lưu vào localStorage
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <Moon className="h-4 w-4" />
            ) : (
                <Sun className="h-4 w-4" />
            )}
        </Button>
    );
}
