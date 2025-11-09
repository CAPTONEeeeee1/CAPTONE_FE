import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Users } from "lucide-react";
import workspaceService from "@/services/workspaceService";
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

export default function ReportsPage() {
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            setIsLoadingWorkspaces(true);
            const response = await workspaceService.getAll();
            setWorkspaces(response.workspaces || []);
        } catch (error) {
            console.error("Error fetching workspaces:", error);
            toast.error("Không thể tải danh sách workspace");
            setWorkspaces([]);
        } finally {
            setIsLoadingWorkspaces(false);
        }
    };

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

    // Mock data - trong thực tế sẽ fetch từ API
    const recentActivities = [
        { id: 1, user: "Nguyễn Văn A", action: "hoàn thành task", item: "Thiết kế giao diện", workspace: "Dự án Website", time: "5 phút trước", type: "completed" },
        { id: 2, user: "Trần Thị B", action: "tạo board mới", item: "Sprint 2", workspace: "Marketing Campaign", time: "15 phút trước", type: "created" },
        { id: 3, user: "Lê Văn C", action: "comment vào", item: "API Integration", workspace: "Mobile App", time: "1 giờ trước", type: "commented" },
        { id: 4, user: "Phạm Thị D", action: "cập nhật", item: "Database Schema", workspace: "Research Project", time: "2 giờ trước", type: "updated" },
        { id: 5, user: "Hoàng Văn E", action: "thêm thành viên", item: "Frontend Team", workspace: "Dự án Website", time: "3 giờ trước", type: "added" },
    ];

    const topPerformers = [
        { id: 1, name: "Phạm Thị D", avatar: "", tasksCompleted: 45, efficiency: 90, workspace: "Research Project" },
        { id: 2, name: "Trần Thị B", avatar: "", tasksCompleted: 42, efficiency: 89, workspace: "Marketing Campaign" },
        { id: 3, name: "Hoàng Văn E", avatar: "", tasksCompleted: 38, efficiency: 88, workspace: "Mobile App" },
        { id: 4, name: "Nguyễn Văn A", avatar: "", tasksCompleted: 35, efficiency: 83, workspace: "Dự án Website" },
        { id: 5, name: "Lê Văn C", avatar: "", tasksCompleted: 30, efficiency: 75, workspace: "Mobile App" },
    ];

    const weeklyStats = [
        { day: "T2", completed: 12, created: 15 },
        { day: "T3", completed: 18, created: 12 },
        { day: "T4", completed: 15, created: 20 },
        { day: "T5", completed: 22, created: 18 },
        { day: "T6", completed: 20, created: 16 },
        { day: "T7", completed: 8, created: 10 },
        { day: "CN", completed: 5, created: 7 },
    ];

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
                                <div className="text-3xl font-bold">{workspaces.length}</div>
                                <p className="mt-1 text-xs text-muted-foreground">Dự án đang hoạt động</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng công việc</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {workspaces.reduce((sum, ws) => sum + ws.tasks, 0)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Tất cả các dự án</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Đã hoàn thành</CardTitle>
                                <BarChart3 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {workspaces.reduce((sum, ws) => sum + ws.completedTasks, 0)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-green-600">
                                        {Math.round(
                                            (workspaces.reduce((sum, ws) => sum + ws.completedTasks, 0) /
                                                workspaces.reduce((sum, ws) => sum + ws.tasks, 0)) *
                                            100
                                        )}
                                        %
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
                                <div className="text-3xl font-bold">
                                    {workspaces.reduce((sum, ws) => sum + ws.members, 0)}
                                </div>
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
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                                            <div className={`p-2 rounded-lg ${activity.type === 'completed' ? 'bg-green-500/10' :
                                                activity.type === 'created' ? 'bg-blue-500/10' :
                                                    activity.type === 'commented' ? 'bg-purple-500/10' :
                                                        activity.type === 'updated' ? 'bg-orange-500/10' :
                                                            'bg-gray-500/10'
                                                }`}>
                                                {activity.type === 'completed' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                ) : activity.type === 'created' ? (
                                                    <Target className="h-4 w-4 text-blue-600" />
                                                ) : activity.type === 'commented' ? (
                                                    <Activity className="h-4 w-4 text-purple-600" />
                                                ) : activity.type === 'updated' ? (
                                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                                ) : (
                                                    <Users className="h-4 w-4 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-semibold">{activity.user}</span>
                                                    {" "}{activity.action}{" "}
                                                    <span className="font-medium text-primary">"{activity.item}"</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {activity.workspace}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
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
                                <CardDescription>Top 5 thành viên có hiệu suất cao nhất</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topPerformers.map((performer, index) => (
                                        <div key={performer.id} className="flex items-center gap-3 pb-4 border-b last:border-0 last:pb-0">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                                                index === 1 ? 'bg-gray-400/20 text-gray-700 dark:text-gray-300' :
                                                    index === 2 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </div>
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={performer.avatar} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {performer.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{performer.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{performer.workspace}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    <span className="text-sm font-semibold">{performer.tasksCompleted}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${performer.efficiency}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{performer.efficiency}%</span>
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
                        {isLoadingWorkspaces ? (
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
