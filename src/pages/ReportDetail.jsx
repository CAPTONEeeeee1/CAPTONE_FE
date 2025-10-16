import React from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";
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

const statusData = [
    { name: "Hoàn thành", value: 45, color: "#10b981" },
    { name: "Đang làm", value: 30, color: "#1A73E8" },
    { name: "Trễ hạn", value: 15, color: "#ef4444" },
    { name: "Chưa bắt đầu", value: 10, color: "#94a3b8" },
];

const memberData = [
    { name: "Nguyễn Văn A", total: 24, completed: 20, percentage: 83 },
    { name: "Trần Thị B", total: 18, completed: 16, percentage: 89 },
    { name: "Lê Văn C", total: 22, completed: 15, percentage: 68 },
    { name: "Phạm Thị D", total: 20, completed: 18, percentage: 90 },
    { name: "Hoàng Văn E", total: 16, completed: 14, percentage: 88 },
];

export default function ReportDetailPage() {
    const { workspaceId } = useParams();

    // Mock workspace data - trong thực tế sẽ fetch từ API
    const workspace = {
        id: workspaceId,
        name: `Dự án ${workspaceId}`,
        description: "Mô tả chi tiết dự án",
    };

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
                                    <h1 className="text-3xl font-bold">Báo cáo: {workspace.name}</h1>
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

                            <Button className="gap-2">
                                <Download className="h-4 w-4" />
                                Xuất báo cáo PDF
                            </Button>
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
                                <div className="text-3xl font-bold">100</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-green-600">+12%</span> so với tháng trước
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Hoàn thành</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">45</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-green-600">45%</span> tỷ lệ hoàn thành
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Đang làm</CardTitle>
                                <Clock className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">30</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-primary">30%</span> đang trong tiến trình
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Trễ hạn</CardTitle>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">15</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="text-destructive">15%</span> cần xử lý gấp
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
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {statusData.map((item) => (
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
                                <CardTitle>Hiệu suất theo thành viên</CardTitle>
                                <CardDescription>Tổng công việc và tỷ lệ hoàn thành</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={memberData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#1A73E8" name="Tổng công việc" />
                                        <Bar dataKey="completed" fill="#10b981" name="Đã hoàn thành" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Member Performance Table */}
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
                                            <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Tổng công việc</th>
                                            <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Đã hoàn thành</th>
                                            <th className="pb-3 text-center text-sm font-medium text-muted-foreground">Tỷ lệ hoàn thành</th>
                                            <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Đánh giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {memberData.map((member) => (
                                            <tr key={member.name} className="border-b last:border-0">
                                                <td className="py-4 text-sm font-medium">{member.name}</td>
                                                <td className="py-4 text-center text-sm">{member.total}</td>
                                                <td className="py-4 text-center text-sm">{member.completed}</td>
                                                <td className="py-4 text-center text-sm">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${member.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-medium">{member.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right text-sm">
                                                    {member.percentage >= 85 ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            Xuất sắc
                                                        </span>
                                                    ) : member.percentage >= 70 ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            Tốt
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                            Cần cải thiện
                                                        </span>
                                                    )}
                                                </td>
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
