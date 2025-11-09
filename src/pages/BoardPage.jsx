import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import boardService from "@/services/boardService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Lock,
  Globe,
  MoreVertical,
  Filter,
  Calendar,
  LayoutGrid,
  List,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

export default function BoardPage() {
  const { id: workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("kanban");
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      setIsLoading(true);
      const response = await boardService.getById(boardId);
      setBoard(response.board || response);
    } catch (error) {
      console.error("Error fetching board:", error);
      toast.error("Không thể tải thông tin board");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 ml-64">
          <DashboardHeader />
          <main className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <Skeleton className="h-96 w-full" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 ml-64">
          <DashboardHeader />
          <main className="p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy board</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Board này không tồn tại hoặc bạn không có quyền truy cập
                </p>
                <Button asChild>
                  <Link to={`/workspaces/${workspaceId}`}>Quay lại workspace</Link>
                </Button>
              </CardContent>
            </Card>
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
          {/* Board Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="mt-1"
              >
                <Link to={`/workspaces/${workspaceId}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
                  <Badge variant={board.mode === "private" ? "secondary" : "outline"}>
                    {board.mode === "private" ? (
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
                  {board.keySlug && (
                    <Badge variant="outline" className="font-mono">
                      {board.keySlug}
                    </Badge>
                  )}
                </div>
                {board.workspaceId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Workspace Name: {board.workspaceId}
                  </p>
                )}
              </div>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/workspaces/${workspaceId}/boards/${boardId}/edit`}>
                      Chỉnh sửa board
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Xóa board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Kanban Board */}
          <KanbanBoard board={board} onUpdate={fetchBoard} />
        </main>
      </div>
    </div>
  );
}
