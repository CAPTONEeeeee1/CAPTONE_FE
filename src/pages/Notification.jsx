import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, MessageSquare, UserPlus, Clock, Mail, MessageCircle, Check, X, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all");
    const [channelFilter, setChannelFilter] = useState("all");
    const [invitations, setInvitations] = useState([]);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
    const [processingInvitationId, setProcessingInvitationId] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setIsLoadingInvitations(true);
            const response = await workspaceService.getMyInvitations();
            setInvitations(response.invitations || response || []);
        } catch (error) {
            console.error("Error fetching invitations:", error);
            setInvitations([]);
        } finally {
            setIsLoadingInvitations(false);
        }
    };

    const handleAcceptInvitation = async (invitationId) => {
        try {
            setProcessingInvitationId(invitationId);
            await workspaceService.acceptInvitation(invitationId);
            toast.success("Đã chấp nhận lời mời!");

            // Remove invitation from list
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        } catch (error) {
            console.error("Error accepting invitation:", error);
            toast.error(error.message || "Không thể chấp nhận lời mời");
        } finally {
            setProcessingInvitationId(null);
        }
    };

    const handleRejectInvitation = async (invitationId) => {
        try {
            setProcessingInvitationId(invitationId);
            await workspaceService.rejectInvitation(invitationId);
            toast.success("Đã từ chối lời mời");

            // Remove invitation from list
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        } catch (error) {
            console.error("Error rejecting invitation:", error);
            toast.error(error.message || "Không thể từ chối lời mời");
        } finally {
            setProcessingInvitationId(null);
        }
    };

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
                                        {invitations.length > 0
                                            ? `${invitations.length} lời mời đang chờ`
                                            : `${notifications.filter((n) => n.status === "unread").length} thông báo chưa đọc`
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="gap-2 bg-transparent">
                                <CheckCheck className="h-4 w-4" />
                                Đánh dấu tất cả đã đọc
                            </Button>
                        </div>

                        {/* Invitations Section */}
                        {isLoadingInvitations ? (
                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                            <Mail className="h-5 w-5 text-blue-600 animate-pulse" />
                                        </div>
                                        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : invitations.length > 0 ? (
                            <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                            <Mail className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">Lời mời tham gia Workspace</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Bạn có {invitations.length} lời mời đang chờ xử lý
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {invitations.map((invitation) => (
                                            <Card key={invitation.id} className="bg-background shadow-sm hover:shadow-md transition-shadow">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                                    <FolderKanban className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-lg">
                                                                        {invitation.workspace?.name || 'Workspace'}
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Workspace
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="pl-[52px] space-y-2">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="text-muted-foreground">Được mời bởi:</span>
                                                                    <span className="font-medium">
                                                                        {invitation.invitedBy?.fullName || invitation.invitedBy?.email || 'Unknown'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <span className="text-muted-foreground">Vai trò:</span>
                                                                    <Badge variant="secondary">
                                                                        {invitation.role === 'admin' && 'Quản trị viên'}
                                                                        {invitation.role === 'maintainer' && 'Bảo trì'}
                                                                        {invitation.role === 'member' && 'Thành viên'}
                                                                        {!['admin', 'maintainer', 'member'].includes(invitation.role) && invitation.role}
                                                                    </Badge>
                                                                </div>
                                                                {invitation.createdAt && (
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Clock className="h-3 w-3" />
                                                                        {new Date(invitation.createdAt).toLocaleString("vi-VN")}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAcceptInvitation(invitation.id)}
                                                                disabled={processingInvitationId === invitation.id}
                                                                className="gap-2 w-full"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                                {processingInvitationId === invitation.id ? "Đang xử lý..." : "Chấp nhận"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRejectInvitation(invitation.id)}
                                                                disabled={processingInvitationId === invitation.id}
                                                                className="gap-2 w-full"
                                                            >
                                                                <X className="h-4 w-4" />
                                                                Từ chối
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

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
