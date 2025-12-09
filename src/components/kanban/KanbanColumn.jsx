import React, { memo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react";
import KanbanCard from './KanbanCard';

const KanbanColumn = memo(({
  column,
  draggedTask,
  draggedList,
  currentUserRole,
  isLoadingCards,
  onDragOver,
  onDrop,
  onAddTask,
  onDragStart,
  onDragEnd,
  onEditTask,
  onDeleteTask,
  onCardClick,
  getPriorityColor,
  getColumnBorderColor,
  onEditList,
  onDeleteList,
  onListDragStart,
  onListDragOver,
  onListDrop
}) => {
  const handleListDragStart = (e) => {
    e.stopPropagation();
    if (onListDragStart) {
      onListDragStart(column);
    }
  };

  const handleListDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onListDragOver) {
      onListDragOver(e);
    }
  };

  const handleListDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onListDrop && draggedList && draggedList.id !== column.id) {
      onListDrop(column.id);
    }
  };

  const isDraggingList = draggedList?.id === column.id;
  const isDropTargetForList = draggedList && draggedList.id !== column.id;
  const isDraggingCard = draggedTask && draggedTask.columnId !== column.id;

  return (
    <div
      key={column.id}
      draggable={currentUserRole && ['owner', 'leader'].includes(currentUserRole)}
      onDragStart={handleListDragStart}
      onDragOver={handleListDragOver}
      onDrop={handleListDrop}
      onDragEnd={() => {
        // Reset any drag state if needed
      }}
      className={`flex-shrink-0 w-80 transition-all duration-200 ease-in-out ${currentUserRole && ['owner', 'leader'].includes(currentUserRole) ? 'cursor-grab active:cursor-grabbing' : ''
        } ${isDraggingList ? 'opacity-40 scale-95 rotate-2' : ''
        } ${isDropTargetForList ? 'ring-4 ring-blue-400 ring-offset-4 rounded-xl scale-105 shadow-2xl' : ''
        } ${isDraggingCard ? 'ring-2 ring-primary/50 ring-offset-2 rounded-lg' : ''
        }`}
      style={{
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Card
        className={`h-full bg-muted/30 border-2 shadow-sm hover:shadow-lg transition-all ${getColumnBorderColor(column.title)} ${isDropTargetForList ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' : ''
          }`}
        onDragOver={onDragOver}
        onDrop={() => onDrop(column.id)}
      >
        <CardHeader
          className={`pb-4 bg-background/50 backdrop-blur-sm rounded-t-lg border-b ${currentUserRole && ['owner', 'leader'].includes(currentUserRole)
              ? 'cursor-grab active:cursor-grabbing hover:bg-background/70'
              : ''
            }`}
          draggable={false}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentUserRole && ['owner', 'leader'].includes(currentUserRole) && (
                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" />
              )}
              <CardTitle className="text-base font-bold tracking-tight">{column.title}</CardTitle>
              <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0 font-semibold bg-primary/10 text-primary border border-primary/20">
                {column.tasks?.length || 0}
              </Badge>
              {column.isDone && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                  Done
                </Badge>
              )}
            </div>
            {currentUserRole && ['owner', 'leader'].includes(currentUserRole) && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAddTask(column.id)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditList(column)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteList(column)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent
          className="space-y-3 pt-4 min-h-[200px]"
          onDragOver={(e) => {
            e.stopPropagation();
            onDragOver(e);
          }}
          onDrop={(e) => {
            e.stopPropagation();
            onDrop(column.id);
          }}
        >
          {isLoadingCards ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">Đang tải công việc</p>
            </div>
          ) : (!column.tasks || column.tasks.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              {draggedTask && draggedTask.columnId !== column.id ? (
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-primary">Thả card vào đây</p>
                </div>
              ) : (
                <>
                  <p className="text-sm">Chưa có task nào</p>
                  {currentUserRole && ['owner', 'leader'].includes(currentUserRole) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddTask(column.id)}
                      className="mt-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm task
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            column.tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                columnId={column.id}
                isDragging={draggedTask?.task?.id === task.id}
                currentUserRole={currentUserRole}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onClick={onCardClick}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
