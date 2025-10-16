import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl flex h-18 items-center justify-between px- sm:px-6 lg:px-8">
                {/* Logo + Navigation */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">P</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">PlanNex</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/about"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Giới thiệu
                        </Link>

                        {/* Nếu muốn bật thêm các mục khác */}
                        {/* 
            <Link
              to="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tính năng
            </Link>
            <Link
              to="/#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Giá
            </Link> 
            */}

                        <Link
                            to="/contact"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Liên hệ
                        </Link>
                    </nav>
                </div>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Link to="/auth">
                        <Button variant="ghost">Đăng nhập</Button>
                    </Link>
                    <Link to="/auth">
                        <Button>Dùng thử miễn phí</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
