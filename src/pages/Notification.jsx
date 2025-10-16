import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, MessageSquare, UserPlus, Clock, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all");
    const [channelFilter, setChannelFilter] = useState("all");

    const notifications = [
        {
            id: "1",
            type: "task",
            title: "Công việc mới được giao",
            content: "Nguyễn Văn A đã giao cho bạn task 'Thiết kế giao diện trang chủ'",
            time: "5 phút trước",
            channel: "in-app",
            status: "unread",
        },
        {
            id: "2",
            type: "comment",
            title: "Bình luận mới",
            content: "Trần Thị B đã bình luận trong task 'Phát triển API backend'",
            time: "15 phút trước",
            channel: "in-app",
            status: "unread",
        },
        {
            id: "3",
            type: "deadline",
            title: "Sắp đến hạn",
            content: "Task 'Viết tài liệu hướng dẫn' sẽ đến hạn trong 2 giờ nữa",
            time: "1 giờ trước",
            channel: "email",
            status: "unread",
        },
        {
            id: "4",
            type: "member",
            title: "Thành viên mới",
            content: "Lê Văn C đã tham gia workspace 'Dự án Website'",
            time: "2 giờ trước",
            channel: "in-app",
            status: "read",
        },
        {
            id: "5",
            type: "task",
            title: "Task đã hoàn thành",
            content: "Phạm Thị D đã hoàn thành task 'Kiểm thử tính năng đăng nhập'",
            time: "3 giờ trước",
            channel: "zalo",
            status: "read",
        },
        {
            id: "6",
            type: "comment",
            title: "Được nhắc đến",
            content: "Hoàng Văn E đã nhắc đến bạn trong một bình luận",
            time: "5 giờ trước",
            channel: "in-app",
            status: "read",
        },
    ];

    const getNotificationIcon = (type) => {
        switch (type) {
            case "task":
                return <CheckCheck className="h-5 w-5 text-primary" />;
            case "comment":
                return <MessageSquare className="h-5 w-5 text-accent" />;
            case "deadline":
                return <Clock className="h-5 w-5 text-destructive" />;
            case "member":
                return <UserPlus className="h-5 w-5 text-green-600" />;
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getChannelIcon = (channel) => {
        switch (channel) {
            case "in-app":
                return <Bell className="h-3 w-3" />;
            case "email":
                return <Mail className="h-3 w-3" />;
            case "zalo":
                return <MessageCircle className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const filteredNotifications = notifications.filter((notif) => {
        const statusMatch = filter === "all" || notif.status === filter;
        const channelMatch = channelFilter === "all" || notif.channel === channelFilter;
        return statusMatch && channelMatch;
    });

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar />
            <div className="flex-1 pl-64">
                <DashboardHeader />

                <main className="p-8 pt-24">
                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                    <Bell className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-balance">Thông báo</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {notifications.filter((n) => n.status === "unread").length} thông báo chưa đọc
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="gap-2 bg-transparent">
                                <CheckCheck className="h-4 w-4" />
                                Đánh dấu tất cả đã đọc
                            </Button>
                        </div>

                        {/* Filters */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Filter by status */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Trạng thái</label>
                                        <Tabs value={filter} onValueChange={(v) => setFilter(v)}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="all">Tất cả</TabsTrigger>
                                                <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
                                                <TabsTrigger value="read">Đã đọc</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>

                                    {/* Filter by channel */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Kênh thông báo</label>
                                        <Tabs value={channelFilter} onValueChange={(v) => setChannelFilter(v)}>
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="all">Tất cả</TabsTrigger>
                                                <TabsTrigger value="in-app">In-app</TabsTrigger>
                                                <TabsTrigger value="email">Email</TabsTrigger>
                                                <TabsTrigger value="zalo">Zalo</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notifications List */}
                        <div className="space-y-3">
                            {filteredNotifications.length === 0 ? (
                                <Card className="shadow-sm">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Bell className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="mt-4 text-muted-foreground">Không có thông báo nào</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredNotifications.map((notif) => (
                                    <Card
                                        key={notif.id}
                                        className={cn(
                                            "cursor-pointer shadow-sm transition-all hover:shadow-md",
                                            notif.status === "unread" && "border-l-4 border-l-primary bg-primary/5"
                                        )}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                                                        {getNotificationIcon(notif.type)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="font-semibold text-balance">{notif.title}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                                {getChannelIcon(notif.channel)}
                                                                <span className="capitalize">{notif.channel}</span>
                                                            </div>
                                                            {notif.status === "unread" && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground text-pretty">{notif.content}</p>
                                                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
