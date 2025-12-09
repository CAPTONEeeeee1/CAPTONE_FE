import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import boardService from "@/services/boardService";
import workspaceService from "@/services/workspaceService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    Layout,
    CheckCircle2,
    Columns3,
    Plus,
    GripVertical,
    X,
    Lock,
    Users,
    Globe,
    Hash,
    Pencil,
    ChevronUp,
    ChevronDown,
    Trash2,
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

const modeOptions = [
    {
        value: "private",
        label: "Riêng tư",
        description: "Thành viên cụ thể truy cập",
        icon: Lock,
    },
    {
        value: "workspace",
        label: "Workspace",
        description: "Tất cả thành viên truy cập",
        icon: Users,
    },
    {
        value: "public",
        label: "Công khai",
        description: "Bất kỳ ai có link đều có thể xem",
        icon: Globe,
    },
];

const defaultColumns = [
    { id: 1, name: "Todo", order: 0, isDone: false },
    { id: 2, name: "In Progress", order: 1, isDone: false },
    { id: 3, name: "Done", order: 2, isDone: true },
];

// Component for individual column item with edit/delete/reorder
function ColumnItem({ column, index, totalColumns, onEdit, onRemove, onMoveUp, onMoveDown, onToggleDone }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(column.name);

    const handleSaveEdit = () => {
        if (editName.trim() && editName.trim() !== column.name) {
            onEdit(column.id, editName.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditName(column.name);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center gap-2 p-3 border-2 rounded-lg bg-muted/20 group hover:border-primary/30 transition-colors">
            <Badge
                variant="secondary"
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center p-0 font-semibold"
            >
                {index + 1}
            </Badge>

            {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="h-8 text-sm"
                        autoFocus
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="h-8 px-3"
                    >
                        Lưu
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-8 px-3"
                    >
                        Hủy
                    </Button>
                </div>
            ) : (
                <>
                    <span className="flex-1 font-medium text-sm">{column.name}</span>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Checkbox
                            id={`isDone-${column.id}`}
                            checked={column.isDone}
                            onCheckedChange={() => onToggleDone(column.id)}
                        />
                        <Label htmlFor={`isDone-${column.id}`}>Là cột hoàn thành</Label>
                    </div>


                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Move Up/Down */}
                        <div className="flex flex-col">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onMoveUp}
                                disabled={index === 0}
                                className="h-5 w-5 p-0 hover:bg-primary/10"
                            >
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onMoveDown}
                                disabled={index === totalColumns - 1}
                                className="h-5 w-5 p-0 hover:bg-primary/10"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* Edit */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="h-8 w-8 hover:bg-primary/10"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        {totalColumns > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(column.id)}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function CreateBoardPage() {
    const navigate = useNavigate();
    const { id: workspaceId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingPermission, setIsCheckingPermission] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [keySlug, setKeySlug] = useState("");
    const [mode, setMode] = useState("private");
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [columns, setColumns] = useState(defaultColumns);
    const [newColumnName, setNewColumnName] = useState("");

    // Check if user has permission to create board
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const response = await workspaceService.getMembers(workspaceId);
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const currentMember = response.members?.find(m => m.user.id === currentUser.id);

                if (!currentMember) {
                    toast.error("Bạn không phải thành viên của workspace này");
                    navigate(`/workspaces/${workspaceId}`);
                    return;
                }

                // Lấy vai trò và chuyển thành chữ thường để so sánh nhất quán
                const userRole = currentMember.role.toLowerCase();

                if (!['owner', 'leader'].includes(userRole)) {
                    toast.error("Chỉ owner hoặc leader mới có thể tạo board");
                    navigate(`/workspaces/${workspaceId}`);
                    return;
                }

                setIsCheckingPermission(false);
            } catch (error) {
                console.error("Error checking permission:", error);
                toast.error("Không thể kiểm tra quyền truy cập");
                navigate(`/workspaces/${workspaceId}`);
            }
        };

        if (workspaceId) {
            checkPermission();
        }
    }, [workspaceId, navigate]);

    const handleAddColumn = () => {
        if (!newColumnName.trim()) {
            toast.error("Vui lòng nhập tên cột");
            return;
        }

        // Check for duplicate names
        const duplicateName = columns.find(col =>
            col.name.toLowerCase() === newColumnName.trim().toLowerCase()
        );
        if (duplicateName) {
            toast.error("Tên cột đã tồn tại");
            return;
        }

        const newColumn = {
            id: Date.now(),
            name: newColumnName.trim(),
            order: columns.length,
            isNew: true,
            isDone: false
        };
        setColumns([...columns, newColumn]);
        setNewColumnName("");
        toast.success("Đã thêm cột mới");
    };

    const handleRemoveColumn = (id) => {
        if (columns.length <= 1) {
            toast.error("Phải có ít nhất 1 cột");
            return;
        }
        setColumns(columns.filter((col) => col.id !== id));
        toast.success("Đã xóa cột");
    };

    const handleEditColumn = (id, newName) => {
        if (!newName.trim()) {
            toast.error("Tên cột không được để trống");
            return;
        }

        // Check for duplicate names (excluding current column)
        const duplicateName = columns.find(col =>
            col.id !== id && col.name.toLowerCase() === newName.trim().toLowerCase()
        );
        if (duplicateName) {
            toast.error("Tên cột đã tồn tại");
            return;
        }

        setColumns(columns.map(col =>
            col.id === id ? { ...col, name: newName.trim() } : col
        ));
        toast.success("Đã cập nhật tên cột");
    };

    const handleReorderColumn = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;

        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);

        // Update order indexes
        const reorderedColumns = newColumns.map((col, index) => ({
            ...col,
            order: index
        }));

        setColumns(reorderedColumns);
        toast.success("Đã sắp xếp lại cột");
    };

    const handleToggleDone = (id) => {
        setColumns(columns.map(col =>
            col.id === id ? { ...col, isDone: !col.isDone } : col
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Vui lòng nhập tên board");
            return;
        }

        // Validate keySlug if provided
        if (keySlug && !/^[A-Z0-9]{2,16}$/.test(keySlug)) {
            toast.error("Key phải từ 2-16 ký tự chữ IN HOA hoặc số");
            return;
        }

        try {
            setIsLoading(true);

            const boardData = {
                workspaceId,
                name: name.trim(),
                mode,
            };

            // Add keySlug if provided
            if (keySlug.trim()) {
                boardData.keySlug = keySlug.trim().toUpperCase();
            }

            // Add lists data
            if (columns.length > 0) {
                boardData.lists = columns.map((col, index) => ({
                    name: col.name,
                    orderIdx: index,
                    isDone: col.isDone
                }));
            }

            const response = await boardService.create(boardData);

            toast.success("Tạo board thành công!");
            navigate(`/workspaces/${workspaceId}/boards/${response.board.id}`);
        } catch (error) {
            console.error("Error creating board:", error);
            toast.error(error.message || "Không thể tạo board. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while checking permission
    if (isCheckingPermission) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="h-8 w-8 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                                <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

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
                                                minLength={3}
                                                maxLength={100}
                                                className="border-2"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {name.length}/100 ký tự (tối thiểu 3 ký tự)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="keySlug">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="h-4 w-4" />
                                                    Key Slug (Tùy chọn)
                                                </div>
                                            </Label>
                                            <Input
                                                id="keySlug"
                                                placeholder="VD: PROJ, DEV, SPRINT..."
                                                value={keySlug}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                    setKeySlug(value);
                                                }}
                                                maxLength={16}
                                                className="border-2 font-mono uppercase"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {keySlug.length}/16 ký tự. Prefix cho card keys (VD: PROJ-123, DEV-45). Chỉ chữ IN HOA (A-Z) và số (0-9), từ 2-16 ký tự.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mode">
                                                Chế độ hiển thị <span className="text-destructive">*</span>
                                            </Label>
                                            <Select value={mode} onValueChange={setMode}>
                                                <SelectTrigger id="mode" className="border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-start gap-3 py-1">
                                                                <option.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                                <div className="space-y-0.5">
                                                                    <p className="font-medium">{option.label}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {option.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* Color Theme */}
                                {/* <Card>
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
                                </Card> */}

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
                                                    <ColumnItem
                                                        key={column.id}
                                                        column={column}
                                                        index={index}
                                                        totalColumns={columns.length}
                                                        onEdit={handleEditColumn}
                                                        onRemove={handleRemoveColumn}
                                                        onMoveUp={() => handleReorderColumn(index, index - 1)}
                                                        onMoveDown={() => handleReorderColumn(index, index + 1)}
                                                        onToggleDone={handleToggleDone}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                💡 Tip: Bạn có thể thêm, xóa, sửa tên và sắp xếp lại cột bất kỳ lúc nào sau khi tạo board
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
                                        disabled={isLoading}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!name.trim() || isLoading}
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
                                                    {keySlug && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Hash className="h-3 w-3 text-muted-foreground" />
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                {keySlug.toUpperCase() || "KEY"}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                {modeOptions.find(m => m.value === mode)?.icon &&
                                                    React.createElement(modeOptions.find(m => m.value === mode).icon, {
                                                        className: "h-4 w-4 text-muted-foreground"
                                                    })
                                                }
                                                <span className="text-muted-foreground">
                                                    {modeOptions.find(m => m.value === mode)?.label}
                                                </span>
                                            </div>
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
