import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Users } from "lucide-react";
import workspaceService from "@/services/workspaceService";
import reportService from "@/services/reportService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    FolderKanban,
    Lock,
    Globe,
    ArrowRight,
    BarChart3,
    TrendingUp,
    Activity,
    Award,
    Clock,
    CheckCircle2,
    AlertCircle,
    Target
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ReportsPage() {
    const [workspaces, setWorkspaces] = useState([]);
    const [overviewData, setOverviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [workspacesResponse, overviewResponse] = await Promise.all([
                    workspaceService.getAll(),
                    reportService.getOverview(),
                ]);
                setWorkspaces(workspacesResponse.workspaces || []);
                setOverviewData(overviewResponse);
            } catch (error) {
                console.error("Error fetching report data:", error);
                toast.error("Không thể tải dữ liệu báo cáo");
                setWorkspaces([]);
                setOverviewData(null);
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

    const translateActivityAction = (action) => {
        const actionMap = {
            'board_created': 'đã tạo bảng',
            'card_created': 'đã tạo thẻ',
            'workspace_created': 'đã tạo không gian làm việc',
        };
        return actionMap[action] || action.replace(/_/g, ' ');
    };

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar />

            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
                            <p className="text-muted-foreground mt-1">
                                Chọn dự án để xem báo cáo chi tiết về tiến độ và hiệu suất
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Tổng quan tất cả dự án
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng dự án</CardTitle>
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold">{overviewData?.overview.totalWorkspaces}</div>}
                                <p className="mt-1 text-xs text-muted-foreground">Dự án đang hoạt động</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng công việc</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold">{overviewData?.overview.totalCards}</div>}
                                <p className="mt-1 text-xs text-muted-foreground">Tất cả các dự án</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Đã hoàn thành</CardTitle>
                                <BarChart3 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold">{overviewData?.overview.completedCards}</div>}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-green-600">
                                        {overviewData?.overview.completionRate || 0}%
                                    </span>{" "}
                                    tỷ lệ hoàn thành
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Thành viên</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold">{overviewData?.overview.totalMembers}</div>}
                                <p className="mt-1 text-xs text-muted-foreground">Tổng số thành viên</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Grid: Recent Activities + Top Performers */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <CardTitle>Hoạt động gần đây</CardTitle>
                                </div>
                                <CardDescription>Cập nhật mới nhất từ các workspace</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isLoading ? ([...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)) :
                                        overviewData?.recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={activity.user.avatar} />
                                                    <AvatarFallback>{activity.user.fullName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">
                                                        <span className="font-semibold">{activity.user.fullName}</span>
                                                        {" "}<span className="text-muted-foreground">{translateActivityAction(activity.action)}</span>{" "}
                                                        <span className="font-medium text-primary">"{activity.entityName}"</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {activity.workspace &&
                                                            <Badge variant="secondary" className="text-xs">
                                                                {activity.workspace.name}
                                                            </Badge>
                                                        }
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

                        {/* Top Performers */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    <CardTitle>Thành viên xuất sắc</CardTitle>
                                </div>
                                <CardDescription>Top 5 thành viên hoàn thành nhiều công việc nhất</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isLoading ? ([...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)) :
                                        overviewData?.topPerformers.map((performer, index) => (
                                            <div key={performer.user.id} className="flex items-center gap-3 pb-4 border-b last:border-0 last:pb-0">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-700 dark:text-gray-300' :
                                                        index === 2 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                                                            'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                                </div>
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={performer.user.avatar} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                        {performer.user.fullName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{performer.user.fullName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                        <span className="text-sm font-semibold">{performer.tasksCompleted}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Workspaces List */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Danh sách dự án</h2>
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
                                    <p className="text-muted-foreground text-center">
                                        Chưa có workspace nào để hiển thị báo cáo
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {workspaces.map((workspace) => (
                                    <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`h-10 w-10 rounded-lg ${getWorkspaceColor(workspace.id)} flex items-center justify-center flex-shrink-0`}
                                                >
                                                    <BarChart3 className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CardTitle className="text-lg truncate">{workspace.name}</CardTitle>
                                                        <Badge
                                                            variant={workspace.visibility === "private" ? "secondary" : "outline"}
                                                            className="text-xs flex items-center gap-1 flex-shrink-0"
                                                        >
                                                            {workspace.visibility === "private" ? (
                                                                <>
                                                                    <Lock className="h-3 w-3" /> Private
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Globe className="h-3 w-3" /> Public
                                                                </>
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
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link to={`/reports/${workspace.id}`}>
                                                    <BarChart3 className="h-4 w-4 mr-2" />
                                                    Xem báo cáo chi tiết
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
