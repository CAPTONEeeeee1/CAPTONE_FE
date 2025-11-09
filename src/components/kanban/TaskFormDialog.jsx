import React, { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const TaskFormDialog = memo(({
  isOpen,
  isEditMode,
  title,
  description,
  priority,
  startDate,
  dueDate,
  selectedAssignees,
  selectedLabels,
  boardMembers,
  boardLabels,
  isLoadingMembers,
  isLoadingLabels,
  isCreating,
  isUpdating,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onStartDateChange,
  onDueDateChange,
  onAssigneesChange,
  onLabelsChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "Chỉnh sửa Card" : "Tạo Card Mới"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode ? "Form chỉnh sửa thông tin thẻ công việc" : "Form tạo mới thẻ công việc"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-semibold">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="Nhập tiêu đề card..."
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="border-2 focus:border-primary"
              disabled={isCreating || isUpdating}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-sm font-semibold">Mô tả</Label>
            <Textarea
              id="task-description"
              placeholder="Mô tả chi tiết về card..."
              rows={4}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="border-2 focus:border-primary resize-none"
              disabled={isCreating || isUpdating}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="task-priority" className="text-sm font-semibold">Độ ưu tiên</Label>
            <Select value={priority} onValueChange={onPriorityChange} disabled={isCreating || isUpdating}>
              <SelectTrigger id="task-priority" className="border-2">
                <SelectValue placeholder="Chọn độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Thấp</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Trung bình</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Cao</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-2"
                    disabled={isCreating || isUpdating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={onStartDateChange}
                    initialFocus
                  />
                  {startDate && (
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => onStartDateChange(null)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Xóa ngày
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Hạn chót</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-2"
                    disabled={isCreating || isUpdating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={onDueDateChange}
                    initialFocus
                  />
                  {dueDate && (
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => onDueDateChange(null)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Xóa ngày
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Người thực hiện</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2"
                  disabled={isCreating || isUpdating}
                >
                  {selectedAssignees.length > 0
                    ? `Đã chọn ${selectedAssignees.length} người`
                    : "Chọn thành viên"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-3" align="start">
                <div className="space-y-2">
                  {isLoadingMembers ? (
                    <div className="text-sm text-muted-foreground text-center py-2">Đang tải...</div>
                  ) : boardMembers.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-2">Chưa có thành viên</div>
                  ) : (
                    boardMembers.map((member) => {
                      const memberId = member.user.id;
                      if (!memberId) return null;

                      return (
                        <div key={`member-${memberId}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${memberId}`}
                            checked={selectedAssignees.includes(memberId)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                onAssigneesChange([...selectedAssignees, memberId]);
                              } else {
                                onAssigneesChange(selectedAssignees.filter(id => id !== memberId));
                              }
                            }}
                          />
                          <label
                            htmlFor={`member-${memberId}`}
                            className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
                          >
                            <span>{member.user.fullName || member.user.email}</span>
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nhãn</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2"
                  disabled={isCreating || isUpdating}
                >
                  {selectedLabels.length > 0
                    ? `Đã chọn ${selectedLabels.length} nhãn`
                    : "Chọn nhãn"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-3" align="start">
                <div className="space-y-2">
                  {isLoadingLabels ? (
                    <div className="text-sm text-muted-foreground text-center py-2">Đang tải...</div>
                  ) : boardLabels.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-2">Chưa có nhãn</div>
                  ) : (
                    boardLabels.map((label) => (
                      <div key={`label-${label.id}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`label-${label.id}`}
                          checked={selectedLabels.includes(label.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onLabelsChange([...selectedLabels, label.id]);
                            } else {
                              onLabelsChange(selectedLabels.filter(id => id !== label.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`label-${label.id}`}
                          className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span>{label.name}</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Cập nhật" : "Tạo Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

TaskFormDialog.displayName = 'TaskFormDialog';

export default TaskFormDialog;
