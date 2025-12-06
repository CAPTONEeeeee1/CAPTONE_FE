import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    FolderKanban,
    BarChart3,
    Bell,
    User,
    Settings,
    Plus,
    LogOut,
    MessageSquare,
} from "lucide-react";
import authService from "@/lib/authService";
import { toast } from "sonner";

// Hàm tiện ích tương tự "cn" (gộp classNames)
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

const navigation = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workspaces", href: "/workspaces", icon: FolderKanban },
    { name: "Báo cáo", href: "/reports", icon: BarChart3 },
    { name: "Thông báo", href: "/notifications", icon: Bell },
    { name: "Hồ sơ", href: "/profile", icon: User },
    { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function DashboardSidebar({ workspace }) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    const handleLogout = () => {
        authService.logout();
        toast.success("Đăng xuất thành công!");
        setTimeout(() => {
            navigate("/auth");
        }, 500);
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
            <div className="flex h-full flex-col gap-4 p-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 px-2 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">P</span>
                    </div>
                    <span className="text-xl font-bold">PlanNex</span>
                </Link>

                {/* Nút tạo Workspace mới */}
                <Button className="w-full justify-start gap-2" asChild>
                    <Link to="/workspaces/create">
                        <Plus className="h-4 w-4" />
                        Tạo Workspace mới
                    </Link>
                </Button>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                    {workspace && workspace.plan === 'PREMIUM' && (
                        <Link
                            to={`/workspaces/${workspace.id}/chat`}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                pathname.includes('/chat')
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Chat
                        </Link>
                    )}
                </nav>

                {/* Đăng xuất */}
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    );
}
