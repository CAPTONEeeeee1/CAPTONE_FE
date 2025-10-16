import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Layout,
    Palette,
    CheckCircle2,
    Columns3,
    Plus,
    GripVertical,
    X,
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

const defaultColumns = [
    { id: 1, name: "To Do", order: 0 },
    { id: 2, name: "In Progress", order: 1 },
    { id: 3, name: "Done", order: 2 },
];

export default function CreateBoardPage() {
    const navigate = useNavigate();
    const { id: workspaceId } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [columns, setColumns] = useState(defaultColumns);
    const [newColumnName, setNewColumnName] = useState("");

    const handleAddColumn = () => {
        if (newColumnName.trim()) {
            const newColumn = {
                id: Date.now(),
                name: newColumnName.trim(),
                order: columns.length,
            };
            setColumns([...columns, newColumn]);
            setNewColumnName("");
        }
    };

    const handleRemoveColumn = (id) => {
        setColumns(columns.filter((col) => col.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Redirect to workspace page
            navigate(`/workspaces/${workspaceId}`);
        }, 1500);
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
                            <Link to={`/workspaces/${workspaceId}`}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Tạo Board mới</h1>
                            <p className="text-muted-foreground mt-1">
                                Tạo bảng quản lý công việc mới cho workspace
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
                                            <Layout className="h-5 w-5 text-primary" />
                                            <CardTitle>Thông tin board</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Nhập thông tin cơ bản cho board của bạn
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Tên board <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="VD: Sprint 1, Design, Backend..."
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
                                                placeholder="Mô tả ngắn gọn về board này..."
                                                rows={4}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="border-2 resize-none"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Color Theme */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Palette className="h-5 w-5 text-primary" />
                                            <CardTitle>Màu sắc</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Chọn màu đại diện cho board
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`relative h-12 w-12 rounded-xl transition-all hover:scale-110 ${selectedColor.value === color.value
                                                            ? "ring-4 ring-primary ring-offset-2 scale-110"
                                                            : "ring-2 ring-border hover:ring-primary/50"
                                                        }`}
                                                    style={{ backgroundColor: color.hex }}
                                                >
                                                    {selectedColor.value === color.value && (
                                                        <CheckCircle2 className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-lg" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Màu đã chọn: <span className="font-semibold">{selectedColor.name}</span>
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Columns Configuration */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Columns3 className="h-5 w-5 text-primary" />
                                            <CardTitle>Cấu hình cột</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Tùy chỉnh các cột cho board của bạn
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Add new column */}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Tên cột mới..."
                                                value={newColumnName}
                                                onChange={(e) => setNewColumnName(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleAddColumn();
                                                    }
                                                }}
                                                className="border-2"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddColumn}
                                                variant="outline"
                                                className="flex-shrink-0"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Thêm
                                            </Button>
                                        </div>

                                        {/* Columns list */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                Danh sách cột ({columns.length})
                                            </Label>
                                            <div className="space-y-2">
                                                {columns.map((column, index) => (
                                                    <div
                                                        key={column.id}
                                                        className="flex items-center gap-2 p-3 border-2 rounded-lg bg-muted/20 group"
                                                    >
                                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                        <Badge
                                                            variant="secondary"
                                                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center p-0 font-semibold"
                                                        >
                                                            {index + 1}
                                                        </Badge>
                                                        <span className="flex-1 font-medium text-sm">
                                                            {column.name}
                                                        </span>
                                                        {columns.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveColumn(column.id)}
                                                                className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                💡 Tip: Bạn có thể thêm hoặc xóa cột bất kỳ lúc nào sau khi tạo board
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(`/workspaces/${workspaceId}`)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!name || columns.length === 0 || isLoading}
                                        className="min-w-32"
                                    >
                                        {isLoading ? "Đang tạo..." : "Tạo Board"}
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
                                        Board sẽ hiển thị như thế này
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Board Card Preview */}
                                    <Card className="border-2">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-12 w-12 rounded-lg ${selectedColor.value} flex items-center justify-center shadow-md`}
                                                >
                                                    <Layout className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">
                                                        {name || "Tên board"}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {description || "Mô tả board"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Columns3 className="h-4 w-4" />
                                                <span>{columns.length} cột</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Columns Preview */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Cấu trúc board</Label>
                                        <div className="space-y-2">
                                            {columns.map((column, index) => (
                                                <div
                                                    key={column.id}
                                                    className="p-3 border-2 rounded-lg bg-muted/30"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs font-semibold"
                                                        >
                                                            {index + 1}
                                                        </Badge>
                                                        <span className="text-sm font-medium truncate">
                                                            {column.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
