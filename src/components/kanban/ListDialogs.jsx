import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ListFormDialog({
    isOpen,
    onClose,
    onSubmit,
    isEditMode = false,
    initialName = "",
    isLoading = false
}) {
    const [name, setName] = useState(initialName);
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
        }
    }, [isOpen, initialName]);

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim(), isDone);
        }
    };

    const handleClose = () => {
        setName("");
        setIsDone(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Chỉnh sửa danh sách" : "Tạo danh sách mới"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Cập nhật tên danh sách" : "Nhập tên cho danh sách mới"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="list-name">Tên danh sách</Label>
                        <Input
                            id="list-name"
                            placeholder="Nhập tên danh sách..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && name.trim()) {
                                    handleSubmit();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    {!isEditMode && (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is-done" checked={isDone} onCheckedChange={setIsDone} />
                            <Label htmlFor="is-done">Đánh dấu là danh sách "Hoàn thành"</Label>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name.trim() || isLoading}>
                        {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteListDialog({
    isOpen,
    onClose,
    onConfirm,
    listName,
    cardCount,
    availableLists,
    isLoading = false
}) {
    const [moveToListId, setMoveToListId] = useState("");

    const handleConfirm = () => {
        if (cardCount > 0 && !moveToListId) {
            return;
        }
        onConfirm(moveToListId || null);
    };

    const handleClose = () => {
        setMoveToListId("");
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa danh sách</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                Bạn có chắc chắn muốn xóa danh sách "<span className="font-semibold text-foreground">{listName}</span>"?
                            </p>
                            {cardCount > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 space-y-3">
                                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                                        ⚠️ Danh sách này có {cardCount} thẻ
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="target-list" className="text-amber-900 dark:text-amber-100">
                                            Chuyển các thẻ sang danh sách:
                                        </Label>
                                        <Select value={moveToListId} onValueChange={setMoveToListId}>
                                            <SelectTrigger id="target-list">
                                                <SelectValue placeholder="Chọn danh sách đích..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableLists.map(list => (
                                                    <SelectItem key={list.id} value={list.id}>
                                                        {list.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleClose} disabled={isLoading}>
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={(cardCount > 0 && !moveToListId) || isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? "Đang xóa..." : "Xóa danh sách"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
