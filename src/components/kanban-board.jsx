import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Calendar, Paperclip, MessageSquare, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function KanbanBoard() {
  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: 1,
          title: "Thiết kế giao diện trang chủ",
          description: "Tạo mockup và wireframe cho trang chủ",
          assignee: { name: "Nguyễn Văn A", avatar: "" },
          deadline: "2025-01-15",
          priority: "high",
          attachments: 3,
          comments: 5,
        },
        {
          id: 2,
          title: "Viết API đăng nhập",
          assignee: { name: "Trần Thị B", avatar: "" },
          deadline: "2025-01-18",
          priority: "medium",
          comments: 2,
        },
        {
          id: 3,
          title: "Setup database schema",
          priority: "high",
          attachments: 1,
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: 4,
          title: "Tích hợp thanh toán Stripe",
          assignee: { name: "Lê Văn C", avatar: "" },
          deadline: "2025-01-20",
          priority: "high",
          comments: 8,
        },
        {
          id: 5,
          title: "Viết unit tests",
          assignee: { name: "Phạm Thị D", avatar: "" },
          priority: "low",
          attachments: 2,
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: 6,
          title: "Setup project repository",
          assignee: { name: "Nguyễn Văn A", avatar: "" },
          priority: "medium",
          comments: 3,
        },
        {
          id: 7,
          title: "Cấu hình CI/CD pipeline",
          assignee: { name: "Trần Thị B", avatar: "" },
          priority: "medium",
        },
      ],
    },
  ]);

  const [draggedTask, setDraggedTask] = useState(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");

  const handleDragStart = (task, columnId) => {
    setDraggedTask({ task, columnId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId) => {
    if (!draggedTask) return;

    const sourceColumn = columns.find((col) => col.id === draggedTask.columnId);
    const targetColumn = columns.find((col) => col.id === targetColumnId);

    if (!sourceColumn || !targetColumn) return;

    const newColumns = columns.map((col) => {
      if (col.id === draggedTask.columnId) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedTask.task.id),
        };
      }
      if (col.id === targetColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, draggedTask.task],
        };
      }
      return col;
    });

    setColumns(newColumns);
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 ring-2 ring-red-500/20";
      case "medium":
        return "bg-orange-500 ring-2 ring-orange-500/20";
      case "low":
        return "bg-green-500 ring-2 ring-green-500/20";
      default:
        return "bg-gray-500 ring-2 ring-gray-500/20";
    }
  };

  const openAddTask = (columnId) => {
    setSelectedColumn(columnId);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 px-2">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          <Card className="h-full bg-muted/30 border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-background/50 backdrop-blur-sm rounded-t-lg border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold tracking-tight">{column.title}</CardTitle>
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0 font-semibold bg-primary/10 text-primary border border-primary/20">
                    {column.tasks.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openAddTask(column.id)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {column.tasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-move hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 transition-all duration-200 bg-background border-2 group"
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)} shadow-sm`} />
                      <span className="text-xs font-medium text-muted-foreground capitalize">{task.priority} priority</span>
                    </div>

                    {task.deadline && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="font-medium">{new Date(task.deadline).toLocaleDateString("vi-VN")}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        {task.attachments && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span className="font-medium">{task.attachments}</span>
                          </div>
                        )}
                        {task.comments && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="font-medium">{task.comments}</span>
                          </div>
                        )}
                      </div>

                      {task.assignee && (
                        <Avatar className="h-7 w-7 border-2 border-background shadow-sm ring-2 ring-primary/10">
                          <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{task.assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Tạo task mới</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Thêm công việc mới vào board của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-semibold">Tiêu đề</Label>
              <Input
                id="task-title"
                placeholder="Nhập tiêu đề task..."
                className="border-2 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description" className="text-sm font-semibold">Mô tả</Label>
              <Textarea
                id="task-description"
                placeholder="Mô tả chi tiết về task..."
                rows={4}
                className="border-2 focus:border-primary resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-deadline" className="text-sm font-semibold">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                className="border-2 focus:border-primary"
              />
            </div>
            <Button className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-shadow">
              <Plus className="mr-2 h-4 w-4" />
              Tạo task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
