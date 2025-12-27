import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";

import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import reportService from "@/services/reportService";

const STATUS_COLORS = {
    "To Do": "#94a3b8",
    "In Progress": "#3b82f6",
    "Done": "#10b981",
    "Backlog": "#f97316",
};

export default function ReportDetailPage() {
    const { workspaceId } = useParams();
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setIsLoading(true);
                const data = await reportService.getWorkspaceReport(workspaceId);
                setReportData(data);
                setError(null);
            } catch (err) {
                const errorMessage = err.response?.data?.error || "Không thể tải báo cáo chi tiết.";
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Error fetching workspace report:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [workspaceId]);

    const pieChartData = reportData?.cardsByStatus.map(item => ({
        name: item.status,
        value: item.count,
        color: STATUS_COLORS[item.status] || '#cccccc'
    })) || [];
    
    const barChartData = reportData?.topPerformers.map(item => ({
        name: item.user.fullName,
        completed: item.tasksCompleted,
    }));
    
    const memberPerformanceData = reportData?.topPerformers.map(item => ({
        name: item.user.fullName,
        tasksCompleted: item.tasksCompleted,
    }));
    
    if (isLoading) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6 space-y-6">
                        <Skeleton className="h-10 w-1/2" />
                        <div className="grid gap-4 md:grid-cols-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                        </div>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                        </div>
                        <Skeleton className="h-96 w-full" />
                    </main>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Đã xảy ra lỗi</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <Button asChild className="mt-6">
                            <Link to="/reports">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                            </Link>
                        </Button>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar />
            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link to="/reports">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold">Báo cáo: {reportData?.workspace.name}</h1>
                                    <p className="mt-1 text-muted-foreground">
                                        Theo dõi tiến độ và hiệu suất làm việc của team
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select defaultValue="month">
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Tuần này</SelectItem>
                                    <SelectItem value="month">Tháng này</SelectItem>
                                    <SelectItem value="quarter">Quý này</SelectItem>
                                    <SelectItem value="year">Năm này</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Removed PDF Export Button */}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng công việc</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{reportData.summary.totalCards}</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                   trong workspace này
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Hoàn thành</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{reportData.summary.completedCards}</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-green-600">{reportData.summary.completionRate}%</span> tỷ lệ hoàn thành
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Đang làm</CardTitle>
                                <Clock className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{pieChartData.find(item => item.name === 'In Progress')?.value || 0}</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    công việc đang tiến hành
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Trễ hạn</CardTitle>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{reportData.summary.overdueCards}</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-destructive">{((reportData.summary.overdueCards / reportData.summary.totalCards) * 100 || 0).toFixed(0)}%</span> cần xử lý gấp
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Phân loại trạng thái công việc</CardTitle>
                                <CardDescription>Tổng quan về trạng thái các task</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {pieChartData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-muted-foreground">
                                                {item.name}: {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top người đóng góp</CardTitle>
                                <CardDescription>Số lượng thẻ đã tạo bởi các thành viên</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="completed" fill="#1A73E8" name="Thẻ đã hoàn thành" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Performers Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thành viên xuất sắc</CardTitle>
                            <CardDescription>Top thành viên hoàn thành nhiều công việc nhất trong workspace này</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reportData?.topPerformers.length === 0 ? (
                                    <p className="text-muted-foreground text-center">Chưa có thành viên nào hoàn thành công việc.</p>
                                ) : (
                                    reportData?.topPerformers.map((performer, index) => (
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
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Performance Table (Deprecated/Replaced by Top Performers Card) */}
                    {/* You might want to remove this section entirely if the Top Performers card is sufficient */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết hiệu suất thành viên</CardTitle>
                            <CardDescription>Bảng thống kê chi tiết theo từng thành viên</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Thành viên</th>
                                            <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Thẻ đã hoàn thành</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {memberPerformanceData.map((member) => (
                                            <tr key={member.name} className="border-b last:border-0">
                                                <td className="py-4 text-sm font-medium">{member.name}</td>
                                                <td className="py-4 text-center text-sm">{member.tasksCompleted}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}