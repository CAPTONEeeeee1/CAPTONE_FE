import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    FolderKanban,
    Lock,
    Globe,
    Users,
    Loader2,
} from "lucide-react";

const colorOptions = [
    { name: "Blue", value: "bg-blue-500", hex: "#3B82F6" },
    { name: "Purple", value: "bg-purple-500", hex: "#A855F7" },
    { name: "Green", value: "bg-green-500", hex: "#10B981" },
    { name: "Orange", value: "bg-orange-500", hex: "#F97316" },
    { name: "Pink", value: "bg-pink-500", hex: "#EC4899" },
    { name: "Red", value: "bg-red-500", hex: "#EF4444" },
    { name: "Indigo", value: "bg-indigo-500", hex: "#6366F1" },
    { name: "Teal", value: "bg-teal-500", hex: "#14B8A6" },
];

export default function CreateWorkspacePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(true);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Vui lòng nhập tên workspace");
            return;
        }

        setIsLoading(true);

        try {
            const workspaceData = {
                name: name.trim(),
                description: description.trim(),
            };

            const response = await workspaceService.create(workspaceData);

            toast.success("Tạo workspace thành công!");

            // Navigate to the new workspace or workspaces list
            setTimeout(() => {
                navigate("/workspaces");
            }, 500);
        } catch (error) {
            console.error("Error creating workspace:", error);

            const errorMessage = error.message || "Có lỗi xảy ra khi tạo workspace";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar />

            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/workspaces">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Tạo Workspace mới</h1>
                            <p className="text-muted-foreground mt-1">
                                Tạo không gian làm việc mới để quản lý dự án của bạn
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FolderKanban className="h-5 w-5 text-primary" />
                                            <CardTitle>Thông tin cơ bản</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Nhập thông tin chính cho workspace của bạn
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Tên workspace <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="VD: Dự án Website, Marketing Campaign..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="border-2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Mô tả</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Mô tả ngắn gọn về workspace này..."
                                                rows={4}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="border-2 resize-none"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Privacy Settings */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            {isPrivate ? (
                                                <Lock className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Globe className="h-5 w-5 text-primary" />
                                            )}
                                            <CardTitle>Quyền riêng tư</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Kiểm soát ai có thể xem và truy cập workspace
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                {isPrivate ? (
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Lock className="h-5 w-5 text-primary" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Globe className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold">
                                                        {isPrivate ? "Private" : "Public"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {isPrivate
                                                            ? "Chỉ thành viên được mời mới có thể truy cập"
                                                            : "Bất kỳ ai cũng có thể xem và tham gia"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={isPrivate}
                                                onCheckedChange={setIsPrivate}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/workspaces")}
                                        disabled={isLoading}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!name.trim() || isLoading}
                                        className="min-w-32"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            "Tạo Workspace"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Preview Section */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-base">Xem trước</CardTitle>
                                    <CardDescription>
                                        Workspace sẽ hiển thị như thế này
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Card className="border-2">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-12 w-12 rounded-lg ${selectedColor.value} flex items-center justify-center shadow-md`}
                                                >
                                                    <FolderKanban className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold truncate">
                                                            {name || "Tên workspace"}
                                                        </h3>
                                                        <Badge
                                                            variant={isPrivate ? "secondary" : "outline"}
                                                            className="text-xs flex items-center gap-1 flex-shrink-0"
                                                        >
                                                            {isPrivate ? (
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
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {description || "Mô tả workspace"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>1 thành viên</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
