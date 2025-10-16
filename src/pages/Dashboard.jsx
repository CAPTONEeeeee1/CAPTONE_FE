import React from "react";
import { Link } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Clock,
    Users,
    TrendingUp,
    FolderKanban,
    Plus,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const workspaces = [
        {
            id: 1,
            name: "Dự án Website",
            description: "Phát triển website cho khóa luận",
            progress: 65,
            members: 5,
            tasks: { total: 24, completed: 16 },
            color: "bg-blue-500",
        },
        {
            id: 2,
            name: "Marketing Campaign",
            description: "Chiến dịch quảng bá sản phẩm mới",
            progress: 40,
            members: 3,
            tasks: { total: 15, completed: 6 },
            color: "bg-orange-500",
        },
        {
            id: 3,
            name: "Mobile App",
            description: "Ứng dụng di động cho startup",
            progress: 85,
            members: 4,
            tasks: { total: 32, completed: 27 },
            color: "bg-green-500",
        },
    ];

    const recentActivities = [
        {
            user: "Nguyễn Văn B",
            action: "đã hoàn thành task",
            task: "Thiết kế giao diện trang chủ",
            workspace: "Dự án Website",
            time: "2 giờ trước",
        },
        {
            user: "Trần Thị C",
            action: "đã thêm",
            task: "Viết content cho landing page",
            workspace: "Marketing Campaign",
            time: "5 giờ trước",
        },
        {
            user: "Lê Văn D",
            action: "đã comment trong",
            task: "Fix bug đăng nhập",
            workspace: "Mobile App",
            time: "1 ngày trước",
        },
    ];

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
                                <div className="text-2xl font-bold">71</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600">+12%</span> so với tháng trước
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">49</div>
                                <p className="text-xs text-muted-foreground">
                                    69% tỷ lệ hoàn thành
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
                                <div className="text-2xl font-bold">18</div>
                                <p className="text-xs text-muted-foreground">
                                    Trong 3 workspace
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">Đang cộng tác</p>
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
                            <Button>
                                <Link to="/workspaces/new" className="flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo mới
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {workspaces.map((workspace) => (
                                <Card
                                    key={workspace.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-10 w-10 rounded-lg ${workspace.color} flex items-center justify-center`}
                                                >
                                                    <FolderKanban className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {workspace.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        {workspace.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Tiến độ</span>
                                                <span className="font-medium">
                                                    {workspace.progress}%
                                                </span>
                                            </div>
                                            <Progress value={workspace.progress} />
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {workspace.tasks.completed}/{workspace.tasks.total}{" "}
                                                    tasks
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {workspace.members} thành viên
                                                </span>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full bg-transparent">
                                            <Link
                                                to={`/workspaces/${workspace.id}`}
                                                className="flex items-center justify-center"
                                            >
                                                Xem chi tiết
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
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
                                {recentActivities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {activity.user.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm">
                                                <span className="font-medium">{activity.user}</span>{" "}
                                                <span className="text-muted-foreground">
                                                    {activity.action}
                                                </span>{" "}
                                                <span className="font-medium">{activity.task}</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {activity.workspace}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.time}
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
