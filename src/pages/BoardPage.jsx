import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import boardService from "@/services/boardService";
import workspaceService from "@/services/workspaceService";
import apiClient from "@/lib/api";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { KanbanBoard } from "@/components/kanban-board";
import { FilterDialog } from "@/components/kanban/FilterDialog";
import { TimelineView } from "@/components/kanban/TimelineView";
import { ListView } from "@/components/kanban/ListView";
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
  AlertCircle,
  X,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BoardPage() {
  const { id: workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState("kanban");
  const [board, setBoard] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardIdToOpen, setCardIdToOpen] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  // Filter states
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState(null); // 'member', 'priority', 'label'
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  // Data for filters
  const [boardMembers, setBoardMembers] = useState([]);
  const [boardLabels, setBoardLabels] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cardId = params.get('cardId');
    if (cardId) {
      setCardIdToOpen(cardId);
    }
  }, [location.search]);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
    if (workspaceId) {
        fetchWorkspace();
    }
  }, [boardId, workspaceId]);

  useEffect(() => {
    if (board?.workspaceId) {
      loadBoardMembers();
    }
    if (board?.id) {
      loadBoardLabels();
    }
  }, [board]);

  const fetchWorkspace = async () => {
      try {
          const response = await workspaceService.getById(workspaceId);
          setWorkspace(response.workspace || response);
      } catch (error) {
          console.error("Error fetching workspace:", error);
          // Don't show a toast here as it might be redundant
      }
  };

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

  const loadBoardMembers = async () => {
    if (!board?.workspaceId) return;
    setIsLoadingMembers(true);
    try {
      const response = await workspaceService.getMembers(board.workspaceId);
      const members = response.data?.members || response.members || [];
      setBoardMembers(members);
    } catch (error) {
      console.error("Error loading workspace members:", error);
      setBoardMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const loadBoardLabels = async () => {
    if (!board?.id) return;
    try {
      const response = await apiClient.get(`/labels?boardId=${board.id}`);
      setBoardLabels(response.labels || []);
    } catch (error) {
      console.error("Error loading board labels:", error);
      setBoardLabels([]);
    }
  };

  const handleOpenFilter = (type) => {
    setFilterType(type);
    setIsFilterDialogOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterDialogOpen(false);
  };

  const handleClearAllFilters = () => {
    setSelectedMember(null);
    setSelectedPriority(null);
    setSelectedLabel(null);
  };

  const handleDeleteBoard = () => {
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteBoard = async () => {
    try {
      await boardService.delete(boardId);
      toast.success("Board đã được xóa thành công!");
      navigate(`/workspaces/${workspaceId}`);
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Không thể xóa board. Vui lòng thử lại.");
    } finally {
      setIsConfirmDeleteDialogOpen(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedMember) count++;
    if (selectedPriority) count++;
    if (selectedLabel) count++;
    return count;
  };

  const getActiveFilterText = () => {
    const filters = [];
    if (selectedMember) {
      const member = boardMembers.find(m => (m.userId || m.user?.id) === selectedMember);
      const user = member?.user || member;
      filters.push(user?.fullName || user?.email || 'Thành viên');
    }
    if (selectedPriority) {
      const priorityMap = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };
      filters.push(priorityMap[selectedPriority] || selectedPriority);
    }
    if (selectedLabel) {
      const label = boardLabels.find(l => l.id === selectedLabel);
      filters.push(label?.name || 'Nhãn');
    }
    return filters.join(', ');
  };

  if (isLoading || !workspace) {
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
        <DashboardSidebar workspace={workspace} />
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
      <DashboardSidebar workspace={workspace} />

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
                {workspace && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Workspace: {workspace.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Thùng rác */}
              <Button
                variant="outline"
                onClick={() => navigate(`/workspaces/${workspaceId}/trash`)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Thùng rác
              </Button>

              {/* Bộ lọc */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={getActiveFilterCount() > 0 ? "default" : "outline"}>
                    <Filter className="mr-2 h-4 w-4" />
                    Bộ lọc
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenFilter('member')}>
                    Theo thành viên
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOpenFilter('priority')}>
                    Theo mức độ ưu tiên
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => handleOpenFilter('label')}>
                    Theo nhãn
                  </DropdownMenuItem> */}
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
                  <DropdownMenuItem className="text-destructive" onClick={handleDeleteBoard}>
                    Xóa board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Đang lọc theo:</span>
              {selectedMember && (
                <Badge variant="secondary" className="py-1.5 px-3 gap-2">
                  {boardMembers.find(m => (m.userId || m.user?.id) === selectedMember)?.user?.fullName ||
                    boardMembers.find(m => (m.userId || m.user?.id) === selectedMember)?.user?.email ||
                    'Thành viên'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setSelectedMember(null)}
                  />
                </Badge>
              )}
              {selectedPriority && (
                <Badge variant="secondary" className="py-1.5 px-3 gap-2">
                  Mức độ: {selectedPriority === 'low' ? 'Thấp' : selectedPriority === 'medium' ? 'Trung bình' : 'Cao'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setSelectedPriority(null)}
                  />
                </Badge>
              )}
              {selectedLabel && (
                <Badge variant="secondary" className="py-1.5 px-3 gap-2">
                  {boardLabels.find(l => l.id === selectedLabel)?.name || 'Nhãn'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setSelectedLabel(null)}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
              >
                Xóa tất cả
              </Button>
            </div>
          )}

          {/* View Rendering */}
          {viewMode === 'kanban' && (
            <KanbanBoard
              board={board}
              onUpdate={fetchBoard}
              selectedMember={selectedMember}
              selectedPriority={selectedPriority}
              selectedLabel={selectedLabel}
              cardIdToOpen={cardIdToOpen}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              board={board}
              selectedMember={selectedMember}
              selectedPriority={selectedPriority}
              selectedLabel={selectedLabel}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              board={board}
              selectedMember={selectedMember}
              selectedPriority={selectedPriority}
              selectedLabel={selectedLabel}
                      />
                    )}
                  </main>
                </div>
            
                {/* Filter Dialog */}
                <FilterDialog
                  isOpen={isFilterDialogOpen}
                  onClose={handleCloseFilter}
                  filterType={filterType}
                  members={boardMembers}
                  labels={boardLabels}
                  selectedMember={selectedMember}
                  selectedPriority={selectedPriority}
                  selectedLabel={selectedLabel}
                  onSelectMember={setSelectedMember}
                  onSelectPriority={setSelectedPriority}
                  onSelectLabel={setSelectedLabel}
                  isLoadingMembers={isLoadingMembers}
                />
            
                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa board này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn chuyển board &quot;{board.name}&quot; vào thùng rác? Bạn có thể khôi phục hoặc xóa vĩnh viễn board này trong vòng 15 ngày.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDeleteBoard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Chuyển vào thùng rác
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>  );
}
