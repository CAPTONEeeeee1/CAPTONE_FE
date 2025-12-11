import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";
import boardService from "@/services/boardService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, Users, Mail, MoreVertical, Lock, Globe, Settings, Trash2, Layout, AlertCircle, LogOut, Rocket, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { dispatchActivityRefreshEvent } from "@/lib/utils"; // Import the event dispatcher

export default function WorkspacePage() {
    const { id: workspaceId } = useParams();
    const navigate = useNavigate();
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("member");
    const [isInviting, setIsInviting] = useState(false);
    const [workspace, setWorkspace] = useState(null);
    const [boards, setBoards] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
    const [isLoadingBoards, setIsLoadingBoards] = useState(true);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [deletingBoardId, setDeletingBoardId] = useState(null);
    const [boardToDelete, setBoardToDelete] = useState(null);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [memberToChangeRole, setMemberToChangeRole] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [isChangingRole, setIsChangingRole] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [isLeavingWorkspace, setIsLeavingWorkspace] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspace();
            fetchBoards();
            fetchMembers();
        }
    }, [workspaceId]);

    const fetchWorkspace = async () => {
        try {
            setIsLoadingWorkspace(true);
            const response = await workspaceService.getById(workspaceId);
            setWorkspace(response.workspace || response);
        } catch (error) {
            console.error("Error fetching workspace:", error);
            toast.error("Không thể tải thông tin workspace");
        } finally {
            setIsLoadingWorkspace(false);
        }
    };

    const fetchBoards = async () => {
        try {
            setIsLoadingBoards(true);
            const response = await workspaceService.getBoards(workspaceId);
            setBoards(response.boards || []);
        } catch (error) {
            console.error("Error fetching boards:", error);
            setBoards([]);
        } finally {
            setIsLoadingBoards(false);
        }
    };

    const fetchMembers = async () => {
        try {
            setIsLoadingMembers(true);
            const response = await workspaceService.getMembers(workspaceId);
            s
            // Convert all roles to lowercase for consistent handling in the frontend
            const lowercaseMembers = (response.members || []).map(m => ({
                ...m,
                role: m.role.toLowerCase()
            }));

            setMembers(lowercaseMembers);

            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const currentMember = lowercaseMembers.find(m => m.user.id === currentUser.id);

            setCurrentUserRole(currentMember?.role || null); // Role is now lowercase
        } catch (error) {
            setMembers([]);
            setCurrentUserRole(null);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleInvite = async () => {
        if (!email.trim()) {
            toast.error("Vui lòng nhập email");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không hợp lệ");
            return;
        }

        try {
            setIsInviting(true);
            await workspaceService.inviteMember(workspaceId, { email: email.trim(), role: selectedRole }); // Giữ nguyên, đã đúng với chuẩn mới

            toast.success(`Đã gửi lời mời đến ${email}. Họ cần chấp nhận lời mời để tham gia workspace.`);
            setEmail("");
            setSelectedRole("member");
            setIsInviteOpen(false);

            // Note: Don't refresh members list since invitation is pending
        } catch (error) {
            console.error("Error inviting member:", error);
            const errorMessage = error.data?.error || error.message || "Không thể gửi lời mời";
            toast.error(errorMessage);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            setIsRemovingMember(true);
            // Use user.id from nested user object
            await workspaceService.removeMember(workspaceId, { memberId: memberToRemove.user.id });

            setMembers(members.filter(m => m.user.id !== memberToRemove.user.id));

            toast.success(`Đã xóa ${memberToRemove.user?.fullName} khỏi workspace`);
        } catch (error) {
            console.error("Error removing member:", error);
            const errorMessage = error.data?.error || error.message || "Không thể xóa thành viên";
            toast.error(errorMessage);
        } finally {
            setIsRemovingMember(false);
            setMemberToRemove(null);
        }
    };

    const handleChangeRole = async () => {
        if (!memberToChangeRole || !newRole) return;

        try {
            setIsChangingRole(true);
            await workspaceService.updateMemberRole(workspaceId, { memberId: memberToChangeRole.user.id, role: newRole }); // Giữ nguyên, đã đúng với chuẩn mới

            setMembers(members.map(m =>
                m.user.id === memberToChangeRole.user.id
                    ? { ...m, role: newRole }
                    : m
            ));

            toast.success(`Đã cập nhật vai trò của ${memberToChangeRole.user?.fullName} thành ${newRole === 'leader' ? 'Leader' :
                newRole === 'member' ? 'Member' : 'Owner'
                }`);
        } catch (error) {
            console.error("Error changing role:", error);
            const errorMessage = error.data?.error || error.message || "Không thể đổi vai trò";
            toast.error(errorMessage);
        } finally {
            setIsChangingRole(false);
            setMemberToChangeRole(null);
            setNewRole("");
        }
    };

    const handleDeleteBoard = async () => {
        if (!boardToDelete) return;

        try {
            setDeletingBoardId(boardToDelete.id);
            await boardService.delete(boardToDelete.id);

            // Remove board from list
            setBoards(boards.filter(b => b.id !== boardToDelete.id));

            toast.success(`Board "${boardToDelete.name}" đã được chuyển vào thùng rác. Sẽ tự động xóa sau 15 ngày.`);
            dispatchActivityRefreshEvent(); // Dispatch event to refresh dashboard activities
        } catch (error) {
            console.error("Error deleting board:", error);
            toast.error(error.message || "Không thể xóa board. Vui lòng thử lại.");
        } finally {
            setDeletingBoardId(null);
            setBoardToDelete(null);
        }
    };

    const handleDeleteWorkspace = async () => {
        try {
            setIsDeletingWorkspace(true);
            await workspaceService.delete(workspaceId);

            toast.success(`Workspace "${workspace.name}" đã được xóa thành công.`);

            // Chuyển hướng về trang danh sách workspaces sau khi xóa
            setTimeout(() => {
                navigate('/workspaces');
            }, 1000);
            dispatchActivityRefreshEvent(); // Dispatch event to refresh dashboard activities
        } catch (error) {
            console.error("Error deleting workspace:", error);
            toast.error(error.data?.error || "Không thể xóa workspace.");
        } finally {
            setIsDeletingWorkspace(false);
            setShowDeleteDialog(false);
        }
    };

    const handleLeaveWorkspace = async () => {
        try {
            setIsLeavingWorkspace(true);
            await workspaceService.leaveWorkspace(workspaceId);

            toast.success(`Bạn đã rời khỏi workspace này thành công`);

            // Redirect to workspaces list after a short delay
            setTimeout(() => {
                navigate('/workspaces');
            }, 1000);
            dispatchActivityRefreshEvent(); // Dispatch event to refresh dashboard activities
        } catch (error) {
            console.error("Error leaving workspace:", error);
            const errorMessage = error.data?.error || error.message || "Không thể rời khỏi workspace";
            toast.error(errorMessage);
        } finally {
            setIsLeavingWorkspace(false);
            setShowLeaveDialog(false);
        }
    };

    const getBoardColor = (id) => {
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

    const countBoardLists = (board) => {
        return board.lists?.length || 0;
    };

    if (isLoadingWorkspace) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6 space-y-6">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </main>
                </div>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6">
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Không tìm thấy workspace</h3>
                                <p className="text-muted-foreground text-center mb-6">
                                    Workspace này không tồn tại hoặc bạn không có quyền truy cập
                                </p>
                                <Button asChild>
                                    <Link to="/workspaces">Quay lại danh sách workspace</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar workspace={workspace} />

            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    {workspace.plan === 'FREE' && (
                        <Alert className="border-primary">
                            <Rocket className="h-4 w-4" />
                            <AlertTitle>Nâng cấp lên Premium</AlertTitle>
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <p>Mở khóa không giới hạn board, thành viên và các tính năng cao cấp khác.</p>
                                    <Button onClick={() => navigate('/checkout', { state: { workspaceId: workspace.id } })}>
                                        Nâng cấp ngay
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* Workspace Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
                                <Badge variant={workspace.visibility === "private" ? "secondary" : "outline"}>
                                    {workspace.visibility === "private" ? (
                                        <>
                                            <Lock className="mr-1 h-3 w-3" />
                                            Private
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="mr-1 h-3 w-3" />
                                            Public
                                        </>
                                    )}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">{workspace.description || "Không có mô tả"}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Settings Dropdown - Dành cho Owner và các vai trò khác */}
                            {currentUserRole && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {['owner', 'leader'].includes(currentUserRole) ? (
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Xóa Workspace
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                onClick={() => setShowLeaveDialog(true)}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Rời khỏi workspace
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {['owner', 'leader'].includes(currentUserRole) && (
                                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Mời thành viên
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Mời thành viên mới</DialogTitle>
                                            <DialogDescription>
                                                Gửi lời mời qua email để thêm thành viên vào workspace
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="ten@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    disabled={isInviting}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !isInviting) {
                                                            handleInvite();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Vai trò</Label>
                                                <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isInviting}>
                                                    <SelectTrigger id="role">
                                                        <SelectValue placeholder="Chọn vai trò" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="leader">Leader - Trưởng nhóm</SelectItem>
                                                        <SelectItem value="member">Member - Thành viên</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedRole === "leader" && "Leader có thể quản lý workspace và mời thành viên mới"}
                                                    {selectedRole === "member" && "Member có thể tạo và quản lý boards"}
                                                </p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={isInviting}>
                                                Hủy
                                            </Button>
                                            <Button onClick={handleInvite} disabled={isInviting}>
                                                {isInviting ? (
                                                    <>
                                                        <span className="mr-2">Đang gửi...</span>
                                                    </>
                                                ) : (
                                                    "Gửi lời mời"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Thành viên</CardTitle>
                                    <CardDescription>Quản lý quyền truy cập và vai trò</CardDescription>
                                </div>
                                <Badge variant="secondary">
                                    <Users className="mr-1 h-3 w-3" />
                                    {members.length} thành viên
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {isLoadingMembers ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    ))}
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có thành viên nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.user?.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                        {member.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{member.user?.fullName || "Unknown User"}</p>
                                                    <p className="text-xs text-muted-foreground">{member.user?.email || ""}</p>
                                                    {member.invitedBy && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Được mời bởi {member.invitedBy.fullName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={member.role === "owner" ? "default" : member.role === "leader" ? "secondary" : "outline"}
                                                >
                                                    {member.role === "owner" && "Owner"}
                                                    {member.role === "leader" && "Leader"}
                                                    {member.role === "member" && "Member"}
                                                    {member.role === "guest" && "Guest"}
                                                </Badge>
                                                {/* Only show menu if current user is owner/admin AND target is not owner AND target is not current user */}
                                                {(() => {
                                                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                                    const isOwnerOrLeader = currentUserRole && ['owner', 'leader'].includes(currentUserRole);
                                                    const targetIsNotOwner = member.role !== "owner";
                                                    const targetIsNotCurrentUser = member.user.id !== currentUser.id;



                                                    return isOwnerOrLeader && targetIsNotOwner && targetIsNotCurrentUser ? (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => {
                                                                    setMemberToChangeRole(member);
                                                                    setNewRole(member.role);
                                                                }}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Đổi vai trò
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => setMemberToRemove(member)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Xóa khỏi workspace
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Boards Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Boards</h2>
                                <p className="text-muted-foreground">Tổ chức công việc theo từng bảng</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Chat button - visible to all members */}
                                {currentUserRole && (
                                    <Button variant="outline" asChild>
                                        <Link to={`/workspaces/${workspaceId}/chat`}>
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Chat
                                        </Link>
                                    </Button>
                                )}
                                {/* Trash and Create board - only for owner and leader */}
                                {currentUserRole && ['owner', 'leader'].includes(currentUserRole) && (
                                    <>
                                        <Button variant="outline" asChild>
                                            <Link to={`/workspaces/${workspaceId}/trash`}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Thùng rác
                                            </Link>
                                        </Button>
                                        <Button asChild>
                                            <Link to={`/workspaces/${workspaceId}/boards/new`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Tạo board mới
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {isLoadingBoards ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <Skeleton className="h-20 w-full" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-10 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : boards.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Chưa có board nào</h3>
                                    {currentUserRole && ['owner', 'leader'].includes(currentUserRole) ? (
                                        <>
                                            <p className="text-muted-foreground text-center mb-6">
                                                Tạo board đầu tiên để bắt đầu quản lý công việc
                                            </p>
                                            <Button asChild>
                                                <Link to={`/workspaces/${workspaceId}/boards/new`}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Tạo board mới
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-center">
                                            Workspace này chưa có board nào. Chỉ owner hoặc leader mới có thể tạo board.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {boards.map((board) => (
                                    <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <Link to={`/workspaces/${workspaceId}/boards/${board.id}`}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div
                                                            className={`h-10 w-10 rounded-lg ${getBoardColor(board.id)} flex items-center justify-center flex-shrink-0`}
                                                        >
                                                            <Layout className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg truncate">{board.name}</CardTitle>
                                                            <CardDescription className="text-sm line-clamp-1">
                                                                {board.keySlug || "No key"}
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    {/* Only show menu if current user is owner or leader */}
                                                    {currentUserRole && ['owner', 'leader'].includes(currentUserRole) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                                <Button variant="ghost" size="icon" className="flex-shrink-0">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link
                                                                        to={`/workspaces/${workspaceId}/boards/${board.id}/edit`}
                                                                        className="flex items-center gap-1 text-sm  hover:underline"
                                                                    >
                                                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                                                        Chỉnh sửa
                                                                    </Link>

                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setBoardToDelete(board);
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Xóa board
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Layout className="h-4 w-4" />
                                                        <span>{countBoardLists(board)} lists</span>
                                                    </div>
                                                    {board.mode && (
                                                        <Badge variant={board.mode === "private" ? "secondary" : "outline"} className="text-xs">
                                                            {board.mode === "private" ? "Private" : "Public"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa board này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn chuyển board <span className="font-semibold text-foreground">"{boardToDelete?.name}"</span> vào thùng rác?
                            <br />
                            <br />
                            Bạn có thể khôi phục hoặc xóa vĩnh viễn board này trong vòng 15 ngày.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingBoardId}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteBoard}
                            disabled={!!deletingBoardId}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deletingBoardId ? "Đang xóa..." : "Xóa board"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Remove Member Confirmation Dialog */}
            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa thành viên này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa <span className="font-semibold text-foreground">"{memberToRemove?.user?.fullName}"</span> khỏi workspace?
                            <br />
                            <br />
                            Thành viên này sẽ mất quyền truy cập vào workspace và tất cả boards bên trong.
                            <span className="text-destructive font-semibold"> Hành động này có thể được hoàn tác bằng cách mời lại.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemovingMember}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            disabled={isRemovingMember}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isRemovingMember ? "Đang xóa..." : "Xóa thành viên"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Change Role Dialog */}
            <Dialog open={!!memberToChangeRole} onOpenChange={(open) => !open && setMemberToChangeRole(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đổi vai trò thành viên</DialogTitle>
                        <DialogDescription>
                            Thay đổi vai trò của <span className="font-semibold text-foreground">{memberToChangeRole?.user?.fullName}</span> trong workspace
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="change-role">Vai trò mới</Label>
                            <Select value={newRole} onValueChange={setNewRole} disabled={isChangingRole}>
                                <SelectTrigger id="change-role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leader">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">Leader</Badge>
                                            <span className="text-xs text-muted-foreground">Trưởng nhóm</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="member">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">Member</Badge>
                                            <span className="text-xs text-muted-foreground">Thành viên</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {newRole === "leader" && "Leader có thể quản lý workspace, mời và xóa thành viên"}
                                {newRole === "member" && "Member có thể tạo và quản lý boards"}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setMemberToChangeRole(null);
                                setNewRole("");
                            }}
                            disabled={isChangingRole}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleChangeRole}
                            disabled={isChangingRole || !newRole || newRole === memberToChangeRole?.role}
                        >
                            {isChangingRole ? "Đang cập nhật..." : "Cập nhật vai trò"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Leave Workspace Confirmation Dialog */}
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rời khỏi workspace này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn rời khỏi workspace <span className="font-semibold text-foreground">"{workspace?.name}"</span>?
                            <br />
                            <br />
                            Bạn sẽ mất quyền truy cập vào workspace này và tất cả boards bên trong.
                            <span className="text-muted-foreground"> Bạn có thể được mời lại sau nếu muốn.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLeavingWorkspace}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeaveWorkspace}
                            disabled={isLeavingWorkspace}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isLeavingWorkspace ? "Đang rời..." : "Rời khỏi workspace"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Workspace Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa vĩnh viễn workspace?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa vĩnh viễn workspace <span className="font-semibold text-foreground">"{workspace?.name}"</span>?
                            <br /><br />
                            Tất cả các board, danh sách công việc, và thành viên liên quan sẽ bị xóa.
                            <span className="text-destructive font-semibold"> Hành động này không thể hoàn tác.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingWorkspace}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWorkspace} disabled={isDeletingWorkspace} className="bg-destructive hover:bg-destructive/90">
                            {isDeletingWorkspace ? "Đang xóa..." : "Xóa vĩnh viễn"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
