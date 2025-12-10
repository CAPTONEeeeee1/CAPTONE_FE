import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";
import notificationService from "@/services/notificationService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, MessageSquare, UserPlus, Clock, Mail, MessageCircle, Check, X, FolderKanban, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");
    const [invitations, setInvitations] = useState([]);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
    const [processingInvitationId, setProcessingInvitationId] = useState(null);

    // Real notifications state
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [markingAllRead, setMarkingAllRead] = useState(false);

    useEffect(() => {
        fetchInvitations();
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [filter, pagination.page]);

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

    const fetchNotifications = async () => {
        try {
            setIsLoadingNotifications(true);
            const unreadOnly = filter === 'unread';
            const response = await notificationService.getNotifications({
                page: pagination.page,
                limit: pagination.limit,
                unreadOnly
            });

            // Filter out workspace_invitation notifications that don't have pending invitations
            const pendingInvitationIds = invitations.map(inv => inv.id);
            const filteredNotifications = (response.notifications || []).filter(notif => {
                // Keep all non-invitation notifications
                if (notif.type !== 'workspace_invitation') return true;
                // Only keep invitation notifications that are still pending
                return pendingInvitationIds.includes(notif.invitationId);
            });

            setNotifications(filteredNotifications);
            setPagination({
                page: response.pagination.page,
                limit: response.pagination.limit,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages
            });
            setUnreadCount(response.unreadCount || 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            toast.error("Không thể tải thông báo");
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const handleAcceptInvitation = async (invitationId) => {
        try {
            setProcessingInvitationId(invitationId);
            await workspaceService.acceptInvitation(invitationId);
            toast.success("Đã chấp nhận lời mời!");

            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

            setNotifications(prev => prev.filter(notif =>
                !(notif.type === 'workspace_invitation' && notif.invitationId === invitationId)
            ));
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

            // Also remove related workspace_invitation notification
            setNotifications(prev => prev.filter(notif =>
                !(notif.type === 'workspace_invitation' && notif.invitationId === invitationId)
            ));
        } catch (error) {
            console.error("Error rejecting invitation:", error);
            toast.error(error.message || "Không thể từ chối lời mời");
        } finally {
            setProcessingInvitationId(null);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
            toast.error("Không thể đánh dấu đã đọc");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setMarkingAllRead(true);
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
            );
            setUnreadCount(0);
            toast.success("Đã đánh dấu tất cả là đã đọc");
        } catch (error) {
            console.error("Error marking all as read:", error);
            toast.error("Không thể đánh dấu tất cả đã đọc");
        } finally {
            setMarkingAllRead(false);
        }
    };

    const handleDeleteNotification = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(notificationId);

            // Remove from local state
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            toast.success("Đã xóa thông báo");
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Không thể xóa thông báo");
        }
    };

    const getNotificationType = (type) => {
        const typeMap = {
            'workspace_invitation': 'member',
            'task_assigned': 'task',
            'task_comment': 'comment',
            'task_deadline': 'deadline',
            'mention': 'comment',
            'member_removed': 'member_action',
            'invitation_accepted': 'invitation_accepted',
            'invitation_rejected': 'invitation_rejected',
            'member_added': 'member_action',
        };
        return typeMap[type] || 'general';
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const handleNotificationClick = async (notif) => {
        // Mark as read if not already
        if (!notif.isRead) {
            await handleMarkAsRead(notif.id);
        }

        // Navigate based on notification type
        if (notif.type === 'task_assigned' && notif.workspaceId) {
            // Navigate to workspace where the task is
            // User can then find the task in boards
            navigate(`/workspaces/${notif.workspaceId}`);
            toast.success("Chuyển đến workspace chứa nhiệm vụ");
        } else if (notif.type === 'workspace_invitation' && notif.invitationId) {
            // Navigate to accept invitation page
            navigate(`/invitations/${notif.invitationId}`);
        } else if (notif.type === 'invitation_accepted' && notif.workspaceId) {
            // Navigate to workspace when someone accepted
            navigate(`/workspaces/${notif.workspaceId}`);
        } else if (notif.type === 'invitation_rejected' && notif.workspaceId) {
            // Navigate to workspace when someone rejected
            navigate(`/workspaces/${notif.workspaceId}`);
        } else if (notif.workspaceId) {
            // Generic workspace navigation
            navigate(`/workspaces/${notif.workspaceId}`);
        } else {
            // Fallback to dashboard
            navigate('/dashboard');
        }
    };

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
                                            : `${unreadCount} thông báo chưa đọc`
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="gap-2 bg-transparent"
                                onClick={handleMarkAllAsRead}
                                disabled={markingAllRead || unreadCount === 0}
                            >
                                <CheckCheck className="h-4 w-4" />
                                {markingAllRead ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
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
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Trạng thái</label>
                                    <Tabs value={filter} onValueChange={(v) => setFilter(v)}>
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="all">
                                                Tất cả
                                                {pagination.total > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {pagination.total}
                                                    </Badge>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="unread">
                                                Chưa đọc
                                                {unreadCount > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {unreadCount}
                                                    </Badge>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="read">Đã đọc</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notifications List */}
                        <div className="space-y-3">
                            {isLoadingNotifications ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Card key={i} className="shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex gap-4">
                                                    <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-5 w-3/4" />
                                                        <Skeleton className="h-4 w-full" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <Card className="shadow-sm">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Bell className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="mt-4 text-muted-foreground">
                                            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {notifications.map((notif) => {
                                        const notifType = getNotificationType(notif.type);
                                        return (
                                            <Card
                                                key={notif.id}
                                                className={cn(
                                                    "cursor-pointer shadow-sm transition-all hover:shadow-md",
                                                    !notif.isRead && "border-l-4 border-l-primary bg-primary/5"
                                                )}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex gap-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                                                                {getNotificationIcon(notifType)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h3 className="font-semibold text-balance">
                                                                            {notif.title || 'Thông báo'}
                                                                        </h3>
                                                                        {!notif.isRead && (
                                                                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                                        )}
                                                                                                                                                 <Badge
                                                                                                                                                     variant={
                                                                                                                                                         notifType === 'task' ? 'default' :
                                                                                                                                                             ['member', 'member_action'].includes(notifType) ? 'secondary' :
                                                                                                                                                                 notifType === 'invitation_accepted' ? 'success' :
                                                                                                                                                                     notifType === 'invitation_rejected' ? 'destructive' :
                                                                                                                                                                         'outline'
                                                                                                                                                     }
                                                                                                                                                     className="text-xs"
                                                                                                                                                 >
                                                                                                                                                     {notifType === 'task' ? 'Nhiệm vụ' :
                                                                                                                                                         notifType === 'member' ? 'Thành viên' :
                                                                                                                                                             notifType === 'member_action' ? 'Hoạt động thành viên' :
                                                                                                                                                                 notifType === 'invitation_accepted' ? 'Lời mời đã chấp nhận' :
                                                                                                                                                                     notifType === 'invitation_rejected' ? 'Lời mời đã từ chối' :
                                                                                                                                                                         notifType === 'comment' ? 'Bình luận' :
                                                                                                                                                                             notifType === 'deadline' ? 'Hạn chót' :
                                                                                                                                                                                 'Thông báo chung'}
                                                                                                                                                 </Badge>                                                                    </div>
                                                                    {notif.sender && (
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Từ: {notif.sender.fullName || notif.sender.email}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => handleDeleteNotification(notif.id, e)}
                                                                    className="flex-shrink-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                                </Button>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground text-pretty">
                                                                {notif.content || notif.message || 'Không có nội dung'}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{getTimeAgo(notif.createdAt)}</span>
                                                                {notif.isRead && notif.readAt && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>Đã đọc lúc {new Date(notif.readAt).toLocaleString('vi-VN')}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-6">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                disabled={pagination.page === 1 || isLoadingNotifications}
                                            >
                                                Trang trước
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                Trang {pagination.page} / {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                disabled={pagination.page === pagination.totalPages || isLoadingNotifications}
                                            >
                                                Trang sau
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
