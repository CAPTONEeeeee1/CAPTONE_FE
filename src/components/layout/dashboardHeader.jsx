import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function DashboardHeader() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            {/* Ô tìm kiếm */}
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm workspace, task..."
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Cụm nút bên phải */}
            <div className="flex items-center gap-2">
                {/* Nút đổi theme */}
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Sun className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Nút thông báo */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => navigate("/notifications")}
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
                </Button>
            </div>
        </header>
    );
}
