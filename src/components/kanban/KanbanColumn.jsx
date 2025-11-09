import React, { memo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanCard from './KanbanCard';

const KanbanColumn = memo(({ 
  column, 
  draggedTask,
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
  getColumnBorderColor
}) => {
  return (
    <div
      key={column.id}
      className={`flex-shrink-0 w-80 transition-all ${
        draggedTask && draggedTask.columnId !== column.id
          ? 'ring-2 ring-primary/50 ring-offset-2 rounded-lg'
          : ''
      }`}
      onDragOver={onDragOver}
      onDrop={() => onDrop(column.id)}
    >
      <Card className={`h-full bg-muted/30 border-2 shadow-sm hover:shadow-md transition-shadow ${getColumnBorderColor(column.title)}`}>
        <CardHeader className="pb-4 bg-background/50 backdrop-blur-sm rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            {currentUserRole && ['owner', 'admin'].includes(currentUserRole) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddTask(column.id)}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 min-h-[200px]">
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
                  {currentUserRole && ['owner', 'admin'].includes(currentUserRole) && (
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
