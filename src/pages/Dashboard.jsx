import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";
import reportService from "@/services/reportService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Clock,
    Users,
    TrendingUp,
    FolderKanban,
    Plus,
    ArrowRight,
    Lock,
    Globe,
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function DashboardPage() {
    const [workspaces, setWorkspaces] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [workspacesResponse, reportResponse] = await Promise.all([
                    workspaceService.getAll(),
                    reportService.getGlobalReport(),
                ]);
                setWorkspaces((workspacesResponse.workspaces || []).slice(0, 3));
                setDashboardData(reportResponse);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Không thể tải dữ liệu dashboard");
                setWorkspaces([]);
                setDashboardData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getWorkspaceColor = (id) => {
        const colors = [
            "bg-blue-500",
            "bg-purple-500",
            "bg-green-500",
            "bg-orange-500",
            "bg-pink-500",
            "bg-red-500",
            "bg-indigo-500",
            "bg-teal-500",
        ];
        const index = id ? parseInt(id.slice(-1), 16) % colors.length : 0;
        return colors[index];
    };

    const completionRate =
        dashboardData?.summary.totalCards > 0
            ? (
                (dashboardData.summary.completedCards /
                    dashboardData.summary.totalCards) *
                100
            ).toFixed(0)
            : 0;


    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main content */}
            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    {/* Welcome Section */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Chào mừng trở lại!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Đây là tổng quan về các dự án và công việc của bạn
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tổng công việc
                                </CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold text-card-foreground">{dashboardData?.summary.totalCards}</div>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold text-card-foreground">{dashboardData?.summary.completedCards}</div>}
                                <p className="text-xs text-muted-foreground">
                                    {completionRate}% tỷ lệ hoàn thành
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Đang thực hiện
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold text-card-foreground">{dashboardData?.summary.inProgressCards}</div>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold text-card-foreground">{dashboardData?.summary.totalMembers}</div>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Workspaces Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Workspaces của bạn
                                </h2>
                                <p className="text-muted-foreground">
                                    Quản lý và theo dõi tiến độ các dự án
                                </p>
                            </div>
                            <Button asChild>
                                <Link to="/workspaces/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo mới
                                </Link>
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-full" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-10 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : workspaces.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground text-center mb-4">
                                        Chưa có workspace nào. Tạo workspace đầu tiên của bạn!
                                    </p>
                                    <Button asChild>
                                        <Link to="/workspaces/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tạo workspace
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {workspaces.map((workspace) => (
                                    <Card
                                        key={workspace.id}
                                        className="hover:shadow-lg transition-shadow"
                                    >
                                        <CardHeader>
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`h-10 w-10 rounded-lg ${getWorkspaceColor(workspace.id)} flex items-center justify-center flex-shrink-0`}
                                                >
                                                    <FolderKanban className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CardTitle className="text-lg truncate">
                                                            {workspace.name}
                                                        </CardTitle>
                                                        <Badge
                                                            variant={
                                                                workspace.visibility === "private"
                                                                    ? "secondary"
                                                                    : "outline"
                                                            }
                                                            className="text-xs flex-shrink-0"
                                                        >
                                                            {workspace.visibility === "private" ? (
                                                                <Lock className="h-3 w-3" />
                                                            ) : (
                                                                <Globe className="h-3 w-3" />
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-sm line-clamp-2">
                                                        {workspace.description || "Không có mô tả"}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                variant="outline"
                                                className="w-full bg-transparent"
                                                asChild
                                            >
                                                <Link to={`/workspaces/${workspace.id}`}>
                                                    Xem chi tiết
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {!isLoading && workspaces.length > 0 && (
                            <div className="text-center">
                                <Button variant="outline" asChild>
                                    <Link to="/workspaces">
                                        Xem tất cả workspaces
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hoạt động gần đây</CardTitle>
                            <CardDescription>
                                Cập nhật mới nhất từ các workspace của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isLoading ? ([...Array(3)].map((_, index) => (
                                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))) : dashboardData?.recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {activity.user.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm">
                                                <span className="font-medium">{activity.user.fullName}</span>{" "}
                                                <span className="text-muted-foreground">
                                                    {activity.action}
                                                </span>{" "}
                                                {activity.workspace ? (
                                                    <Link to={`/ws/${activity.workspace.id}/settings`} className="font-medium">{activity.details}</Link>
                                                ) : (
                                                    <span className="font-medium">{activity.details}</span>
                                                )}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {activity.workspace && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {activity.workspace.name}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
