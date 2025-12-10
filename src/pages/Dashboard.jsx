import authService from "@/lib/authService"; // Import authService
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
import { subscribeToActivityRefreshEvent, unsubscribeFromActivityRefreshEvent } from "@/lib/utils"; // Import event utilities

export default function DashboardPage() {
    const [workspaces, setWorkspaces] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // New states for recent activities pagination
    const [recentActivities, setRecentActivities] = useState([]);
    const [activityPage, setActivityPage] = useState(1);
    const [activityLimit] = useState(10); // Load 10 activities per click, fixed limit
    const [hasMoreActivities, setHasMoreActivities] = useState(true);
    const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // New state to trigger activity refresh


    const isAuthenticated = authService.isAuthenticated(); // Read auth status

    // Function to fetch activities
    const fetchActivities = async (page, limit, append = false) => {
        try {
            if (append) setIsLoadingMoreActivities(true);
            const response = await reportService.getOverview({ page, limit });
            const newActivities = response.recentActivities || [];

            setRecentActivities(prevActivities =>
                append ? [...prevActivities, ...newActivities] : newActivities
            );
            setHasMoreActivities(response.pagination.hasMore);
            setActivityPage(page);
            return response; // Return response for initial data fetch
        } catch (error) {
            console.error("Error fetching activities:", error);
            toast.error("Không thể tải hoạt động gần đây");
            return null;
        } finally {
            if (append) setIsLoadingMoreActivities(false);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) {
                setWorkspaces([]);
                setDashboardData(null);
                setRecentActivities([]); // Clear activities on logout
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // Fetch initial activities (page 1, limit 10)
                const [workspacesResponse, userDashboardReportResponse, initialActivitiesResponse] = await Promise.all([
                    workspaceService.getAll(),
                    reportService.getUserDashboardReport(),
                    fetchActivities(1, activityLimit), // Use fetchActivities for initial load
                ]);

                setWorkspaces((workspacesResponse.workspaces || []).slice(0, 3));
                setDashboardData({
                    ...userDashboardReportResponse,
                    // initialActivitiesResponse already updates recentActivities state
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Không thể tải dữ liệu dashboard");
                setWorkspaces([]);
                setDashboardData(null);
                setRecentActivities([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, activityLimit, refreshKey]); // Add refreshKey to dependencies

    const handleRefreshActivities = () => {
        setRecentActivities([]); // Clear current activities
        setActivityPage(1); // Reset page to 1
        setHasMoreActivities(true); // Assume there are more
        setRefreshKey(prev => prev + 1); // Trigger useEffect
    };

    // New useEffect for event subscription
    useEffect(() => {
        subscribeToActivityRefreshEvent(handleRefreshActivities);
        return () => {
            unsubscribeFromActivityRefreshEvent(handleRefreshActivities);
        };
    }, []); // Empty dependency array means this runs once on mount and unmount

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

    const translateActivityAction = (action) => {
        const actionMap = {
            'board_created': 'tạo bảng',
            'renamed_board': 'đã đổi tên bảng',
            'deleted_board': 'đã xóa bảng',
            'pinned_board': 'đã ghim bảng',
            'unpinned_board': 'đã bỏ ghim bảng',
            'added_comment': 'đã thêm bình luận',
            'updated_comment': 'đã cập nhật bình luận',
            'deleted_comment': 'đã xóa bình luận',
            'updated_workspace_details': 'đã cập nhật chi tiết không gian làm việc',
            'deleted_workspace': 'đã xóa không gian làm việc',
            'removed_member': 'đã xóa thành viên',
            'left_workspace': 'đã rời khỏi không gian làm việc',
            'updated_member_role': 'đã cập nhật vai trò thành viên',
            'card_created': 'đã tạo thẻ',
            'created_board': 'đã tạo bảng',
            'workspace_created': 'đã tạo không gian làm việc',
            // Thêm các hành động khác ở đây nếu cần
        };
        return actionMap[action] || action.replace(/_/g, ' ');
    };

    const handleLoadMoreActivities = () => {
        if (!isLoadingMoreActivities && hasMoreActivities) {
            fetchActivities(activityPage + 1, activityLimit, true);
        }
    };

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
                                                        {workspace.plan === 'PREMIUM' && (
                                                            <Badge className="text-xs flex items-center gap-1 flex-shrink-0 bg-yellow-500 text-white">
                                                                Premium
                                                            </Badge>
                                                        )}
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
                                        {authService.isAuthenticated() && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Hoạt động gần đây</CardTitle>
                                                    <CardDescription>
                                                        Cập nhật mới nhất từ các workspace của bạn
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {isLoading && recentActivities.length === 0 ? ([...Array(3)].map((_, index) => (
                                                            <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                                                <Skeleton className="h-9 w-9 rounded-full" />
                                                                <div className="flex-1 space-y-2">
                                                                    <Skeleton className="h-4 w-3/4" />
                                                                    <Skeleton className="h-3 w-1/2" />
                                                                </div>
                                                            </div>
                                                        ))) : recentActivities.length > 0 ? recentActivities.map((activity) => (
                                                            <div
                                                                key={activity.id}
                                                                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                                                            >
                                                                <Avatar className="h-9 w-9">
                                                                    <AvatarFallback>
                                                                        {activity.user?.fullName?.charAt(0) || activity.user?.email?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 space-y-1">
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">{activity.user?.fullName || activity.user?.email || 'Unknown User'}</span>{" "}
                                                                        <span className="text-muted-foreground">
                                                                            {translateActivityAction(activity.action)}
                                                                        </span>{" "}
                                                                        <span className="font-medium">{activity.entityName}</span>
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
                                                        )) : (
                                                            <div className="text-center text-muted-foreground py-8">Không có hoạt động gần đây</div>
                                                        )}
                                                    </div>
                                                    {/* Load More Button */}
                                                    {hasMoreActivities && (
                                                        <div className="text-center mt-6">
                                                            <Button
                                                                variant="outline"
                                                                onClick={handleLoadMoreActivities}
                                                                disabled={isLoadingMoreActivities}
                                                            >
                                                                {isLoadingMoreActivities ? "Đang tải..." : "Xem thêm"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}                </main>
            </div>
        </div>
    );
}