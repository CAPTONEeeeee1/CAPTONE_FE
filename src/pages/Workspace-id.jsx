import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Users, Mail, MoreVertical, Lock, Globe, Settings, Trash2, Layout } from "lucide-react";
import { Link } from "react-router-dom";

export default function WorkspacePage() {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [email, setEmail] = useState("");

    const workspace = {
        id: 1,
        name: "Dự án Website",
        description: "Phát triển website cho khóa luận",
        isPrivate: true,
    };

    const members = [
        { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "Owner", avatar: "" },
        { id: 2, name: "Trần Thị B", email: "tranthib@example.com", role: "Admin", avatar: "" },
        { id: 3, name: "Lê Văn C", email: "levanc@example.com", role: "Member", avatar: "" },
        { id: 4, name: "Phạm Thị D", email: "phamthid@example.com", role: "Member", avatar: "" },
    ];

    const boards = [
        { id: 1, name: "Sprint 1", description: "Giai đoạn phát triển đầu tiên", tasks: 24, color: "bg-blue-500" },
        { id: 2, name: "Design", description: "Thiết kế giao diện và UX", tasks: 12, color: "bg-purple-500" },
        { id: 3, name: "Backend", description: "Phát triển API và database", tasks: 18, color: "bg-green-500" },
    ];

    const handleInvite = () => {
        console.log("Inviting:", email);
        setEmail("");
        setIsInviteOpen(false);
    };

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar />

            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    {/* Workspace Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
                                <Badge variant={workspace.isPrivate ? "secondary" : "outline"}>
                                    {workspace.isPrivate ? (
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
                            <p className="text-muted-foreground">{workspace.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>

                            {/* Invite Dialog */}
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
                                            />
                                        </div>
                                        <Button onClick={handleInvite} className="w-full">
                                            Gửi lời mời
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant={member.role === "Owner" ? "default" : "secondary"}>{member.role}</Badge>
                                            {member.role !== "Owner" && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Đổi vai trò</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">
                                                            Xóa khỏi workspace
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Boards Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Boards</h2>
                                <p className="text-muted-foreground">Tổ chức công việc theo từng bảng</p>
                            </div>
                            <Button asChild>
                                <Link to={`/workspaces/${workspace.id}/boards/new`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo board mới
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {boards.map((board) => (
                                <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <Link to={`/workspaces/${workspace.id}/boards/${board.id}`}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-10 w-10 rounded-lg ${board.color} flex items-center justify-center`}
                                                    >
                                                        <Layout className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{board.name}</CardTitle>
                                                        <CardDescription className="text-sm">{board.description}</CardDescription>
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                                        <DropdownMenuItem>Sao chép</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Xóa board
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Layout className="h-4 w-4" />
                                                <span>{board.tasks} tasks</span>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
