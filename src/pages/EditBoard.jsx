import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import boardService from "@/services/boardService";
import workspaceService from "@/services/workspaceService";
import listService from "@/services/listService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Layout,
    Palette,
    CheckCircle2,
    Columns3,
    Plus,
    GripVertical,
    X,
    AlertCircle,
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

// Component for individual column item with edit/delete/reorder in EditBoard
function ColumnItemEdit({ column, index, totalColumns, onEdit, onRemove, onMoveUp, onMoveDown, isOperating }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(column.name);

    const handleSaveEdit = async () => {
        if (editName.trim() && editName.trim() !== column.name) {
            await onEdit(column.id, editName.trim());
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
                        disabled={isOperating}
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isOperating}
                        className="h-8 px-3"
                    >
                        Lưu
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isOperating}
                        className="h-8 px-3"
                    >
                        Hủy
                    </Button>
                </div>
            ) : (
                <>
                    <span className="flex-1 font-medium text-sm">{column.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Move Up/Down */}
                        <div className="flex flex-col">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onMoveUp}
                                disabled={index === 0 || isOperating}
                                className="h-5 w-5 p-0 hover:bg-primary/10"
                            >
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onMoveDown}
                                disabled={index === totalColumns - 1 || isOperating}
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
                            disabled={isOperating}
                            className="h-8 w-8 hover:bg-primary/10"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(column)}
                            disabled={isOperating}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function EditBoardPage() {
    const navigate = useNavigate();
    const { id: workspaceId, boardId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [columns, setColumns] = useState([]);
    const [newColumnName, setNewColumnName] = useState("");
    const [isListOperating, setIsListOperating] = useState(false);
    const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
    const [moveToListId, setMoveToListId] = useState("");

    // Check permission first
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

                if (!['owner', 'admin'].includes(currentMember.role)) {
                    toast.error("Chỉ owner hoặc admin mới có thể chỉnh sửa board");
                    navigate(`/workspaces/${workspaceId}`);
                    return;
                }

                setHasPermission(true);
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

    // Fetch board data
    useEffect(() => {
        if (!hasPermission) return;

        const fetchBoard = async () => {
            try {
                setIsFetching(true);
                const response = await boardService.getById(boardId);
                const board = response.board || response;

                setName(board.name || "");
                setDescription(board.description || "");

                // Set columns from board lists
                if (board.lists && board.lists.length > 0) {
                    const loadedColumns = board.lists
                        .sort((a, b) => a.orderIdx - b.orderIdx)
                        .map((list) => ({
                            id: list.id,
                            name: list.name,
                            orderIdx: list.orderIdx,
                            isDone: list.isDone || false,
                            cardCount: list._count?.cards || 0
                        }));
                    setColumns(loadedColumns);
                }
            } catch (error) {
                console.error("Error fetching board:", error);
                toast.error("Không thể tải thông tin board");
            } finally {
                setIsFetching(false);
            }
        };

        if (boardId) {
            fetchBoard();
        }
    }, [boardId, hasPermission]);

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) {
            toast.error("Vui lòng nhập tên cột");
            return;
        }

        try {
            setIsListOperating(true);
            const response = await listService.create(boardId, newColumnName.trim());
            const newList = response.list;

            const newColumn = {
                id: newList.id,
                name: newList.name,
                orderIdx: newList.orderIdx,
                isDone: newList.isDone || false,
                cardCount: 0
            };

            setColumns([...columns, newColumn]);
            setNewColumnName("");
            toast.success("Đã thêm cột mới");
        } catch (error) {
            console.error("Error creating list:", error);
            toast.error(error.response?.data?.error || "Không thể tạo cột");
        } finally {
            setIsListOperating(false);
        }
    };

    const handleEditColumn = async (listId, newName) => {
        if (!newName.trim()) {
            toast.error("Tên cột không được để trống");
            return;
        }

        try {
            setIsListOperating(true);
            await listService.update(listId, { name: newName.trim() });

            setColumns(columns.map(col =>
                col.id === listId ? { ...col, name: newName.trim() } : col
            ));

            toast.success("Đã cập nhật tên cột");
        } catch (error) {
            console.error("Error updating list:", error);
            toast.error(error.response?.data?.error || "Không thể cập nhật cột");
        } finally {
            setIsListOperating(false);
        }
    };

    const handleRemoveColumn = (column) => {
        setListToDelete(column);
        setMoveToListId("");
        setDeleteListDialogOpen(true);
    };

    const handleConfirmDeleteList = async () => {
        if (!listToDelete) return;

        try {
            setIsListOperating(true);

            // If list has cards, need to move them
            if (listToDelete.cardCount > 0 && !moveToListId) {
                toast.error("Vui lòng chọn cột đích để chuyển các thẻ");
                setIsListOperating(false);
                return;
            }

            await listService.delete(listToDelete.id, moveToListId || null);

            setColumns(columns.filter(col => col.id !== listToDelete.id));
            setDeleteListDialogOpen(false);
            setListToDelete(null);
            setMoveToListId("");
            toast.success("Đã xóa cột thành công");
        } catch (error) {
            console.error("Error deleting list:", error);
            toast.error(error.response?.data?.error || "Không thể xóa cột");
        } finally {
            setIsListOperating(false);
        }
    };

    const handleReorderColumn = async (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;

        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);

        // Update order indexes
        const reorderedColumns = newColumns.map((col, index) => ({
            ...col,
            orderIdx: index
        }));

        // Optimistically update UI
        setColumns(reorderedColumns);

        try {
            setIsListOperating(true);
            const orders = reorderedColumns.map(col => ({
                id: col.id,
                orderIdx: col.orderIdx
            }));

            await listService.reorder(boardId, orders);
            toast.success("Đã sắp xếp lại cột");
        } catch (error) {
            console.error("Error reordering lists:", error);
            toast.error(error.response?.data?.error || "Không thể sắp xếp lại cột");
            // Revert on error
            const response = await boardService.getById(boardId);
            const board = response.board || response;
            if (board.lists) {
                const revertedColumns = board.lists
                    .sort((a, b) => a.orderIdx - b.orderIdx)
                    .map((list) => ({
                        id: list.id,
                        name: list.name,
                        orderIdx: list.orderIdx,
                        isDone: list.isDone || false,
                        cardCount: list._count?.cards || 0
                    }));
                setColumns(revertedColumns);
            }
        } finally {
            setIsListOperating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            toast.error("Vui lòng nhập tên board");
            return;
        }

        if (name.trim().length < 3) {
            toast.error("Tên board phải có ít nhất 3 ký tự");
            return;
        }

        if (name.trim().length > 100) {
            toast.error("Tên board không được vượt quá 100 ký tự");
            return;
        }

        if (description.trim().length > 500) {
            toast.error("Mô tả không được vượt quá 500 ký tự");
            return;
        }

        try {
            setIsLoading(true);

            await boardService.rename(boardId, name.trim());

            toast.success("Cập nhật board thành công!");
            navigate(`/workspaces/${workspaceId}`);
        } catch (error) {
            console.error("Error updating board:", error);
            toast.error(error.message || "Không thể cập nhật board. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                        </div>
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </div>
                            <Skeleton className="h-96 w-full" />
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
                            <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Board</h1>
                            <p className="text-muted-foreground mt-1">
                                Cập nhật thông tin board của bạn
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
                                            Cập nhật thông tin cơ bản cho board của bạn
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
                                            <Label htmlFor="description">Mô tả</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Mô tả ngắn gọn về board này..."
                                                rows={4}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                maxLength={500}
                                                className="border-2 resize-none"
                                                disabled
                                            />
                                            <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Chức năng cập nhật mô tả chưa được hỗ trợ bởi API
                                            </p>
                                        </div>
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
                                            Quản lý các cột của board - Thêm, sửa, xóa và sắp xếp lại
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
                                                disabled={isListOperating}
                                                className="border-2"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddColumn}
                                                variant="outline"
                                                disabled={isListOperating}
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
                                                {columns.length > 0 ? (
                                                    columns.map((column, index) => (
                                                        <ColumnItemEdit
                                                            key={column.id}
                                                            column={column}
                                                            index={index}
                                                            totalColumns={columns.length}
                                                            onEdit={handleEditColumn}
                                                            onRemove={handleRemoveColumn}
                                                            onMoveUp={() => handleReorderColumn(index, index - 1)}
                                                            onMoveDown={() => handleReorderColumn(index, index + 1)}
                                                            isOperating={isListOperating}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                                        <AlertCircle className="h-8 w-8 mb-2" />
                                                        <p className="text-sm">Chưa có cột nào</p>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                💡 Tip: Bạn có thể thêm, xóa, sửa tên và sắp xếp lại cột ngay tại đây
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
                                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
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
                                            {columns.length > 0 ? (
                                                columns.map((column, index) => (
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
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-sm text-muted-foreground">
                                                    Chưa có cột
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            {/* Delete List Dialog */}
            <AlertDialog open={deleteListDialogOpen} onOpenChange={setDeleteListDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa cột "{listToDelete?.name}"</AlertDialogTitle>
                        <AlertDialogDescription>
                            {listToDelete?.cardCount > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-destructive font-medium">
                                        ⚠️ Cột này có {listToDelete.cardCount} thẻ.
                                    </p>
                                    <p>Vui lòng chọn cột đích để chuyển các thẻ trước khi xóa:</p>
                                    <Select value={moveToListId} onValueChange={setMoveToListId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cột đích..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns
                                                .filter(col => col.id !== listToDelete?.id)
                                                .map(col => (
                                                    <SelectItem key={col.id} value={col.id}>
                                                        {col.name} ({col.cardCount} thẻ)
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <p>
                                    Bạn có chắc chắn muốn xóa cột này? Hành động này không thể hoàn tác.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteListDialogOpen(false);
                                setListToDelete(null);
                                setMoveToListId("");
                            }}
                            disabled={isListOperating}
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeleteList}
                            disabled={isListOperating || (listToDelete?.cardCount > 0 && !moveToListId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isListOperating ? "Đang xóa..." : "Xóa cột"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
