import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, Paperclip, MoreVertical, Pencil, Trash2 } from "lucide-react";

const KanbanCard = memo(({
  task,
  columnId,
  isDragging,
  currentUserRole,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onClick,
  getPriorityColor
}) => {
  const handleCardClick = (e) => {
    if (e.defaultPrevented) return;
    onClick(task.id);
  };

  return (
    <Card
      className={`cursor-move hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 transition-all duration-200 bg-background group ${isDragging ? 'opacity-50 scale-95' : ''
        }`}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(task, columnId);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEnd();
      }}
      onClick={handleCardClick}
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Header: Title and Menu */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-snug flex-1 group-hover:text-primary transition-colors">
            {task.title}
          </h4>
          {currentUserRole && currentUserRole !== 'guest' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task, columnId);
                }}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                {currentUserRole && ['owner', 'admin'].includes(currentUserRole) && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task, columnId);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description Preview */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: `${label.color}20`,
                  borderColor: label.color,
                  color: label.color
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Priority Badge */}
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
          <span className="text-xs text-muted-foreground font-medium">
            {task.priority === 'high' && 'Cao'}
            {task.priority === 'medium' && 'Trung bình'}
            {task.priority === 'low' && 'Thấp'}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-1.5">
          {task.startDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Bắt đầu: {new Date(task.startDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              <span className={
                new Date(task.deadline) < new Date()
                  ? 'text-red-600 font-medium'
                  : 'text-muted-foreground'
              }>
                Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>

        {/* Footer: Members, Attachments and Comments */}
        <div className="flex items-center justify-between gap-3 pt-1.5 border-t">
          <div className="flex items-center gap-3">
            {task.attachments > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments}</span>
              </div>
            )}
            {task.comments > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments}</span>
              </div>
            )}
          </div>

          {/* Members */}
          {task.members && task.members.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                <TooltipProvider>
                  {task.members.slice(0, 3).map((member, index) => {
                    const memberName = member.user?.fullName || member.user?.email || 'Unknown';
                    const initials = memberName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <Tooltip key={member.userId || index}>
                        <TooltipTrigger asChild>
                          <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-border">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-medium">{memberName}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
                {task.members.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      +{task.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

KanbanCard.displayName = 'KanbanCard';

export default KanbanCard;
