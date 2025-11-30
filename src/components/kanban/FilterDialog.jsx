import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, User, Flag, Tag } from "lucide-react";

export function FilterDialog({
    isOpen,
    onClose,
    filterType, // 'member', 'priority', 'label'
    members = [],
    labels = [],
    selectedMember,
    selectedPriority,
    selectedLabel,
    onSelectMember,
    onSelectPriority,
    onSelectLabel,
    isLoadingMembers
}) {
    const priorities = [
        { value: 'low', label: 'Thấp', color: 'bg-green-500' },
        { value: 'medium', label: 'Trung bình', color: 'bg-yellow-500' },
        { value: 'high', label: 'Cao', color: 'bg-red-500' }
    ];

    const handleSelect = (value) => {
        if (filterType === 'member') {
            onSelectMember(selectedMember === value ? null : value);
        } else if (filterType === 'priority') {
            onSelectPriority(selectedPriority === value ? null : value);
        } else if (filterType === 'label') {
            onSelectLabel(selectedLabel === value ? null : value);
        }
    };

    const getDialogTitle = () => {
        switch (filterType) {
            case 'member':
                return 'Lọc theo thành viên';
            case 'priority':
                return 'Lọc theo mức độ ưu tiên';
            case 'label':
                return 'Lọc theo nhãn';
            default:
                return 'Bộ lọc';
        }
    };

    const getDialogDescription = () => {
        switch (filterType) {
            case 'member':
                return 'Chọn thành viên để lọc các card được gán cho họ';
            case 'priority':
                return 'Chọn mức độ ưu tiên để lọc card';
            case 'label':
                return 'Chọn nhãn để lọc card';
            default:
                return '';
        }
    };

    const renderMemberList = () => {
        if (isLoadingMembers) {
            return (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (members.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    Không có thành viên nào
                </div>
            );
        }

        return (
            <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                    {members.map((member) => {
                        const user = member.user || member;
                        const userId = member.userId || user.id;
                        const isSelected = selectedMember === userId;

                        return (
                            <button
                                key={userId}
                                onClick={() => handleSelect(userId)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-accent ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-xs">
                                        {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">{user.fullName || user.email}</p>
                                    {user.email && user.fullName && (
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    )}
                                </div>
                                {isSelected && (
                                    <Check className="h-5 w-5 text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        );
    };

    const renderPriorityList = () => {
        return (
            <div className="space-y-2">
                {priorities.map((priority) => {
                    const isSelected = selectedPriority === priority.value;

                    return (
                        <button
                            key={priority.value}
                            onClick={() => handleSelect(priority.value)}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all hover:bg-accent ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                }`}
                        >
                            <div className={`h-4 w-4 rounded-full ${priority.color}`}></div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{priority.label}</p>
                            </div>
                            {isSelected && (
                                <Check className="h-5 w-5 text-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderLabelList = () => {
        if (labels.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    Không có nhãn nào
                </div>
            );
        }

        return (
            <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                    {labels.map((label) => {
                        const isSelected = selectedLabel === label.id;

                        return (
                            <button
                                key={label.id}
                                onClick={() => handleSelect(label.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-accent ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                            >
                                <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                ></div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">{label.name}</p>
                                </div>
                                {isSelected && (
                                    <Check className="h-5 w-5 text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>{getDialogDescription()}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {filterType === 'member' && renderMemberList()}
                    {filterType === 'priority' && renderPriorityList()}
                    {filterType === 'label' && renderLabelList()}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
