import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lock, Globe, MoreVertical, Filter, Calendar, LayoutGrid, List } from "lucide-react";

export default function BoardPage() {
  const [viewMode, setViewMode] = useState("kanban");

  const board = {
    id: 1,
    name: "Sprint 1",
    description: "Giai đoạn phát triển đầu tiên",
    isPrivate: true,
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 ml-64">
        <DashboardHeader />

        <main className="p-6 space-y-6">
          {/* Board Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
              <Badge variant={board.isPrivate ? "secondary" : "outline"}>
                {board.isPrivate ? (
                  <>
                    <Lock className="mr-1 h-3 w-3" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="mr-1 h-3 w-3" />
                    Public
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Bộ lọc */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Bộ lọc
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Theo thành viên</DropdownMenuItem>
                  <DropdownMenuItem>Theo trạng thái</DropdownMenuItem>
                  <DropdownMenuItem>Theo deadline</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chế độ xem */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {viewMode === "kanban" && <LayoutGrid className="mr-2 h-4 w-4" />}
                    {viewMode === "timeline" && <Calendar className="mr-2 h-4 w-4" />}
                    {viewMode === "list" && <List className="mr-2 h-4 w-4" />}
                    Chế độ xem
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewMode("kanban")}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Kanban
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("timeline")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Timeline
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("list")}>
                    <List className="mr-2 h-4 w-4" />
                    Danh sách
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          <KanbanBoard />
        </main>
      </div>
    </div>
  );
}
