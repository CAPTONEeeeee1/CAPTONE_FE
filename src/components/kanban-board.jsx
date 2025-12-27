import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import cardService from "@/services/cardService";
import commentService from "@/services/commentService";
import workspaceService from "@/services/workspaceService";
import listService from "@/services/listService";
import boardSocketService from "@/services/boardSocketService";
import apiClient from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, Clock, User, MessageSquare, Send, Pencil, Trash2, X, Tag, MoreVertical, AlertCircle, Plus } from "lucide-react";
import KanbanColumn from "./kanban/KanbanColumn";
import TaskFormDialog from "./kanban/TaskFormDialog";
import { ListFormDialog, DeleteListDialog } from "./kanban/ListDialogs";


export function KanbanBoard({ board, onUpdate, selectedMember, selectedPriority, selectedLabel, cardIdToOpen }) {
  const [columns, setColumns] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedList, setDraggedList] = useState(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [startDate, setStartDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);

  const [boardMembers, setBoardMembers] = useState([]);
  const [boardLabels, setBoardLabels] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [isEditListOpen, setIsEditListOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [isListOperating, setIsListOperating] = useState(false);

  useEffect(() => {
    if (cardIdToOpen) {
      openCardDetail(cardIdToOpen);
    }
  }, [cardIdToOpen]);

  useEffect(() => {
    if (board && board.lists) {
      const transformedColumns = board.lists
        .sort((a, b) => a.orderIdx - b.orderIdx)
        .map((list) => ({
          id: list.id,
          title: list.name,
          orderIdx: list.orderIdx,
          isDone: list.isDone,
          tasks: [],
        }));
      setColumns(transformedColumns);
      loadCardsForAllLists(transformedColumns);
      if (board.workspaceId) {
        loadBoardMembers();
      }
    }
  }, [board]);

  useEffect(() => {
    if (isAddTaskOpen && board?.id) {
      loadBoardMembers();
      loadBoardLabels();
    }
  }, [isAddTaskOpen, board?.id]);

  const loadBoardMembers = useCallback(async () => {
    if (!board?.workspaceId) return;
    setIsLoadingMembers(true);
    try {
      const response = await workspaceService.getMembers(board.workspaceId);
      const members = response.data?.members || response.members || [];
      setBoardMembers(members);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentMember = members.find(m => {
        const memberUserId = m.userId || m.user?.id;
        return memberUserId === currentUser.id;
      });

      if (currentMember) {
        setCurrentUserRole(currentMember.role.toLowerCase());
      } else {
        setCurrentUserRole(null);
      }
    } catch (error) {
      console.error("Error loading workspace members:", error);
      setBoardMembers([]);
      setCurrentUserRole(null);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [board?.workspaceId]);

  const loadBoardLabels = useCallback(async () => {
    if (!board?.id) return;
    setIsLoadingLabels(true);
    try {
      const response = await apiClient.get(`/labels?boardId=${board.id}`);
      setBoardLabels(response.labels || []);
    } catch (error) {
      console.error("Error loading board labels:", error);
      setBoardLabels([]);
    } finally {
      setIsLoadingLabels(false);
    }
  }, [board?.id]);

  const loadCardsForAllLists = useCallback(async (lists) => {
    setIsLoadingCards(true);
    try {
      const cardsPromises = lists.map(list =>
        cardService.getByListId(list.id).catch(err => {
          console.error(`Error loading cards for list ${list.id}:`, err);
          return { items: [] };
        })
      );

      const cardsResults = await Promise.all(cardsPromises);

      const updatedColumns = lists.map((list, index) => {
        const cardsData = cardsResults[index];
        const cards = cardsData.items || [];

        const tasks = cards.map(card => ({
          id: card.id,
          title: card.title,
          description: card.description,
          priority: card.priority || 'medium',
          deadline: card.dueDate,
          startDate: card.startDate,
          members: card.members || [],
          assignee: card.members && card.members.length > 0 ? {
            name: card.members[0].user?.fullName || 'Unknown',
            avatar: card.members[0].user?.avatar
          } : null,
          attachments: 0,
          comments: 0,
          labels: card.labels || [],
          orderIdx: card.orderIdx
        }));

        return {
          ...list,
          tasks: tasks.sort((a, b) => a.orderIdx - b.orderIdx)
        };
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Không thể tải danh sách cards");
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  const handleListDragStart = useCallback((list) => {
    setDraggedList(list);
  }, []);

  const handleListDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleListDrop = useCallback(async (targetListId) => {
    if (!draggedList || draggedList.id === targetListId) {
      setDraggedList(null);
      return;
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedList.id);
    const targetIndex = columns.findIndex(col => col.id === targetListId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedList(null);
      return;
    }

    // Optimistically update UI
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, movedColumn);

    // Update orderIdx for all columns
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      orderIdx: index
    }));

    setColumns(updatedColumns);
    setDraggedList(null);

    // Call API to persist the change
    try {
      const orders = updatedColumns.map(col => ({
        id: col.id,
        orderIdx: col.orderIdx
      }));

      await listService.reorder(board.id, orders);
      toast.success("Đã sắp xếp lại cột!");

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error reordering lists:", error);
      toast.error("Không thể sắp xếp lại cột");

      // Revert to original order on error
      if (board && board.lists) {
        const revertedColumns = board.lists
          .sort((a, b) => a.orderIdx - b.orderIdx)
          .map((list) => ({
            id: list.id,
            title: list.name,
            orderIdx: list.orderIdx,
            isDone: list.isDone,
            tasks: columns.find(c => c.id === list.id)?.tasks || [],
          }));
        setColumns(revertedColumns);
      }
    }
  }, [draggedList, columns, board, onUpdate]);

  const handleDragStart = useCallback((task, columnId) => {
    setDraggedTask({ task, columnId });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (targetColumnId) => {
    if (!draggedTask) return;

    const sourceColumnId = draggedTask.columnId;
    const draggedCardId = draggedTask.task.id;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const sourceColumn = columns.find((col) => col.id === sourceColumnId);
    const targetColumn = columns.find((col) => col.id === targetColumnId);

    if (!sourceColumn || !targetColumn) return;

    const newOrderIdx = targetColumn.tasks.length;
    const movedTask = { ...draggedTask.task, orderIdx: newOrderIdx };

    const newColumns = columns.map((col) => {
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedCardId),
        };
      }
      if (col.id === targetColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, movedTask].sort((a, b) => a.orderIdx - b.orderIdx),
        };
      }
      return col;
    });

    setColumns(newColumns);
    setDraggedTask(null);

    try {
      await cardService.move(draggedCardId, targetColumnId, newOrderIdx);
      toast.success("Di chuyển công việc thành công!");
    } catch (error) {
      console.error("Error moving card:", error);
      toast.error("Không thể di chuyển công việc. Vui lòng thử lại.");

      reloadCardsForList(sourceColumnId);
      reloadCardsForList(targetColumnId);
    }
  }, [columns, draggedTask]);

  const getPriorityColor = useCallback((priority) => {
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
  }, []);

  const openAddTask = useCallback((columnId) => {
    setSelectedColumn(columnId);
    setIsAddTaskOpen(true);
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề card");
      return;
    }

    if (!selectedColumn) {
      toast.error("Vui lòng chọn list");
      return;
    }

    // Validate dates
    if (startDate && dueDate && startDate > dueDate) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày deadline");
      return;
    }

    try {
      setIsCreating(true);

      const cardData = {
        boardId: board.id,
        listId: selectedColumn,
        title: title.trim(),
        priority,
      };

      if (description && description.trim()) {
        cardData.description = description.trim();
      }

      if (startDate) {
        cardData.startDate = startDate.toISOString();
      }

      if (dueDate) {
        cardData.dueDate = dueDate.toISOString();
      }

      if (selectedAssignees.length > 0) {
        cardData.assigneeIds = selectedAssignees;
      }

      if (selectedLabels.length > 0) {
        cardData.labelIds = selectedLabels;
      }

      const response = await cardService.create(cardData);
      const newCard = response.card || response;

      const optimisticTask = {
        id: newCard.id,
        title: newCard.title,
        description: newCard.description || null,
        priority: newCard.priority || 'medium',
        deadline: newCard.dueDate || null,
        startDate: newCard.startDate || null,
        assignee: null,
        attachments: newCard.attachments?.length || 0,
        comments: 0,
        labels: newCard.labels || [],
        members: newCard.members || [],
        orderIdx: newCard.orderIdx || 0,
        key: newCard.key || null
      };

      if (newCard.members && newCard.members.length > 0) {
        const firstMember = newCard.members[0];
        if (firstMember.user) {
          optimisticTask.assignee = {
            name: firstMember.user.fullName,
            avatar: null
          };
        }
      }

      setColumns(prevColumns =>
        prevColumns.map(col =>
          col.id === selectedColumn
            ? { ...col, tasks: [...col.tasks, optimisticTask].sort((a, b) => a.orderIdx - b.orderIdx) }
            : col
        )
      );

      // Show success message with notification info
      if (selectedAssignees.length > 0) {
        const assigneeNames = newCard.members
          ?.map(m => m.user?.fullName)
          .filter(Boolean)
          .join(', ') || `${selectedAssignees.length} thành viên`;

        toast.success(
          `Tạo card thành công! Đã gửi thông báo đến ${assigneeNames}`,
          {
            description: "Thành viên đã nhận thông báo qua hệ thống và email",
            duration: 4000
          }
        );
      } else {
        toast.success("Tạo card thành công!");
      }

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStartDate(null);
      setDueDate(null);
      setSelectedAssignees([]);
      setSelectedLabels([]);
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error(error.message || "Không thể tạo card. Vui lòng thử lại.");

      reloadCardsForList(selectedColumn);
    } finally {
      setIsCreating(false);
    }
  }, [selectedColumn, title, description, priority, startDate, dueDate, selectedAssignees, selectedLabels, board.id]);

  const reloadCardsForList = useCallback(async (listId) => {
    try {
      const cardsData = await cardService.getByListId(listId);
      const cards = cardsData.items || [];

      const tasks = cards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        priority: card.priority || 'medium',
        deadline: card.dueDate,
        startDate: card.startDate,
        assignee: card.members && card.members.length > 0 ? {
          name: card.members[0].user?.fullName || 'Unknown',
          avatar: card.members[0].user?.avatar
        } : null,
        attachments: 0,
        comments: 0,
        labels: card.labels || [],
        orderIdx: card.orderIdx
      }));

      setColumns(prevColumns =>
        prevColumns.map(col =>
          col.id === listId
            ? { ...col, tasks: tasks.sort((a, b) => a.orderIdx - b.orderIdx) }
            : col
        )
      );
    } catch (error) {
      console.error("Error reloading cards:", error);
    }
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsAddTaskOpen(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStartDate(null);
    setDueDate(null);
    setSelectedAssignees([]);
    setSelectedLabels([]);
  }, []);

  const openEditTask = useCallback(async (task, columnId) => {
    setSelectedColumn(columnId);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority || "medium");

    try {
      const response = await cardService.getById(task.id);
      const fullCard = response.card || response;

      setEditingTask(fullCard);

      setStartDate(fullCard.startDate ? new Date(fullCard.startDate) : null);
      setDueDate(fullCard.dueDate ? new Date(fullCard.dueDate) : null);

      const assigneeIds = fullCard.members?.map(m => m.userId) || [];
      setSelectedAssignees(assigneeIds);

      const labelIds = fullCard.labels?.map(l => l.labelId) || [];
      setSelectedLabels(labelIds);

    } catch (error) {
      console.error("Error loading card details for edit:", error);
      setEditingTask(task);
    }

    if (board?.workspaceId) {
      loadBoardMembers();
      loadBoardLabels();
    }

    setIsEditTaskOpen(true);
  }, [board?.workspaceId, loadBoardMembers, loadBoardLabels]);

  const handleUpdateTask = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề card");
      return;
    }

    if (!editingTask) {
      toast.error("Không tìm thấy card cần chỉnh sửa");
      return;
    }

    // Validate dates
    if (startDate && dueDate && startDate > dueDate) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày deadline");
      return;
    }

    try {
      setIsUpdating(true);

      const updateData = {
        title: title.trim(),
        priority,
      };

      if (description && description.trim()) {
        updateData.description = description.trim();
      } else {
        updateData.description = "";
      }

      if (startDate) {
        updateData.startDate = startDate.toISOString();
      }

      if (dueDate) {
        updateData.dueDate = dueDate.toISOString();
      }

      await cardService.update(editingTask.id, updateData);

      if (editingTask.members) {
        const currentMemberIds = editingTask.members.map(m => m.userId);

        const toAdd = selectedAssignees.filter(id => !currentMemberIds.includes(id));

        const toRemove = currentMemberIds.filter(id => !selectedAssignees.includes(id));

        for (const userId of toAdd) {
          try {
            await cardService.assignMember(editingTask.id, userId);
          } catch (err) {
            console.error(`Failed to assign member ${userId}:`, err);
          }
        }

        for (const userId of toRemove) {
          try {
            await cardService.removeMember(editingTask.id, userId);
          } catch (err) {
            console.error(`Failed to remove member ${userId}:`, err);
          }
        }

        // Show notification message if new members were added
        if (toAdd.length > 0) {
          const newMemberNames = boardMembers
            .filter(m => toAdd.includes(m.userId || m.user?.id))
            .map(m => m.user?.fullName || m.fullName)
            .filter(Boolean)
            .join(', ') || `${toAdd.length} thành viên`;

          toast.success(
            `Cập nhật card thành công! Đã gửi thông báo đến ${newMemberNames}`,
            {
              description: "Thành viên mới đã nhận thông báo qua hệ thống và email",
              duration: 4000
            }
          );
        } else {
          toast.success("Cập nhật card thành công!");
        }
      } else {
        toast.success("Cập nhật card thành công!");
      }

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStartDate(null);
      setDueDate(null);
      setSelectedAssignees([]);
      setSelectedLabels([]);
      setIsEditTaskOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error(error.response?.data?.error || "Không thể cập nhật card. Vui lòng thử lại.");

      reloadCardsForList(selectedColumn);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedColumn, editingTask, title, description, priority, startDate, dueDate, selectedAssignees, selectedLabels, reloadCardsForList]);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditTaskOpen(false);
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStartDate(null);
    setDueDate(null);
    setSelectedAssignees([]);
    setSelectedLabels([]);
  }, []);

  const confirmDeleteTask = useCallback((task, columnId) => {
    setTaskToDelete({ task, columnId });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteTask = useCallback(async () => {
    if (!taskToDelete) return;

    try {
      setIsDeleting(true);

      const { task, columnId } = taskToDelete;

      // Optimistically remove the card from the UI immediately
      setColumns(prevColumns =>
        prevColumns.map(col =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter(t => t.id !== task.id) }
            : col
        )
      );

      setDeleteDialogOpen(false);

      await cardService.delete(task.id);

      toast.success(`Card "${task.title}" đã được chuyển vào thùng rác. Sẽ tự động xóa sau 15 ngày.`);

      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error(error.message || "Không thể xóa card. Vui lòng thử lại.");

      if (taskToDelete) {
        reloadCardsForList(taskToDelete.columnId);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [taskToDelete, reloadCardsForList]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  }, []);

  const loadComments = useCallback(async (cardId) => {
    try {
      setIsLoadingComments(true);
      const response = await commentService.getByCardId(cardId);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  const openCardDetail = useCallback(async (cardId) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailOpen(true);

      const response = await cardService.getById(cardId);
      setSelectedCard(response.card || response);

      // Load comments for this card
      loadComments(cardId);
    } catch (error) {
      console.error("Error loading card detail:", error);
      toast.error("Không thể tải thông tin card");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [loadComments]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung comment");
      return;
    }

    if (!selectedCard) return;

    try {
      setIsAddingComment(true);
      const response = await commentService.create(selectedCard.id, {
        bodyMd: newComment.trim()
      });

      setComments(prev => [...prev, response.comment]);
      setNewComment("");
      toast.success("Đã thêm comment");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Không thể thêm comment");
    } finally {
      setIsAddingComment(false);
    }
  }, [newComment, selectedCard]);

  const handleEditComment = useCallback((comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.bodyMd);
  }, []);

  const handleUpdateComment = useCallback(async (commentId) => {
    if (!editingCommentText.trim()) {
      toast.error("Vui lòng nhập nội dung comment");
      return;
    }

    try {
      const response = await commentService.update(commentId, {
        bodyMd: editingCommentText.trim()
      });

      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, bodyMd: response.comment.bodyMd } : c
      ));

      setEditingCommentId(null);
      setEditingCommentText("");
      toast.success("Đã cập nhật comment");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Không thể cập nhật comment");
    }
  }, [editingCommentText]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!commentToDelete) return;

    try {
      setIsDeletingComment(true);
      await commentService.delete(commentToDelete.id);

      setComments(prev => prev.filter(c => c.id !== commentToDelete.id));

      setDeleteCommentDialogOpen(false);
      setCommentToDelete(null);
      toast.success("Đã xóa comment");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Không thể xóa comment");
    } finally {
      setIsDeletingComment(false);
    }
  }, [commentToDelete]);

  const confirmDeleteComment = useCallback((comment) => {
    setCommentToDelete(comment);
    setDeleteCommentDialogOpen(true);
  }, []);

  const handleCancelDeleteComment = useCallback(() => {
    setDeleteCommentDialogOpen(false);
    setCommentToDelete(null);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedCard(null);
    setComments([]);
    setNewComment("");
    setEditingCommentId(null);
    setEditingCommentText("");
    setDeleteCommentDialogOpen(false);
    setCommentToDelete(null);
  }, []);

  const getColumnBorderColor = useCallback((columnTitle) => {
    const title = columnTitle.toLowerCase();
    if (title === 'todo') return 'border-cyan-100';
    if (title === 'in progress') return 'border-red-100';
    if (title === 'done') return 'border-green-100';
    return 'border-border';
  }, []);

  const handleCreateList = useCallback(async (name, isDone) => {
    if (!board?.id) return;

    try {
      setIsListOperating(true);
      const response = await listService.create(board.id, name, isDone);
      const newList = response.list;

      const newColumn = {
        id: newList.id,
        title: newList.name,
        orderIdx: newList.orderIdx,
        isDone: newList.isDone,
        tasks: []
      };

      setColumns(prev => [...prev, newColumn].sort((a, b) => a.orderIdx - b.orderIdx));
      setIsAddListOpen(false);
      toast.success("Tạo danh sách thành công!");

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error creating list:", error);
              toast.error(error.data?.error || error.message || "Không thể tạo danh sách");    } finally {
      setIsListOperating(false);
    }
  }, [board?.id, onUpdate]);

  const handleEditList = useCallback((list) => {
    setEditingList(list);
    setIsEditListOpen(true);
  }, []);

  const handleUpdateList = useCallback(async (name) => {
    if (!editingList) return;

    try {
      setIsListOperating(true);
      await listService.update(editingList.id, { name });

      setColumns(prev => prev.map(col =>
        col.id === editingList.id
          ? { ...col, title: name }
          : col
      ));

      setIsEditListOpen(false);
      setEditingList(null);
      toast.success("Cập nhật danh sách thành công!");

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error(error.response?.data?.error || "Không thể cập nhật danh sách");
    } finally {
      setIsListOperating(false);
    }
  }, [editingList, onUpdate]);

  const handleDeleteList = useCallback((list) => {
    setListToDelete(list);
    setDeleteListDialogOpen(true);
  }, []);

  const handleConfirmDeleteList = useCallback(async (moveToListId) => {
    if (!listToDelete) return;

    try {
      setIsListOperating(true);
      await listService.delete(listToDelete.id, moveToListId);

      setColumns(prev => prev.filter(col => col.id !== listToDelete.id));
      setDeleteListDialogOpen(false);
      setListToDelete(null);
      toast.success("Xóa danh sách thành công!");

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error(error.response?.data?.error || "Không thể xóa danh sách");
    } finally {
      setIsListOperating(false);
    }
  }, [listToDelete, onUpdate]);

  // Filter cards based on selected filters
  const filterCards = useCallback((tasks) => {
    if (!tasks) return tasks;

    // If no filters are active, return all tasks
    if (!selectedMember && !selectedPriority && !selectedLabel) {
      return tasks;
    }

    return tasks.filter(task => {
      const taskData = task.task || task;
      let matches = true;

      // Filter by member
      if (selectedMember) {
        const members = taskData.members || [];
        const hasMember = members.some(member => {
          const memberUserId = member.userId || member.user?.id || member.id;
          return memberUserId === selectedMember;
        });
        matches = matches && hasMember;
      }

      // Filter by priority
      if (selectedPriority) {
        matches = matches && taskData.priority === selectedPriority;
      }

      // Filter by label
      if (selectedLabel) {
        const labels = taskData.labels || [];
        const hasLabel = labels.some(label => {
          const labelId = label.labelId || label.id;
          return labelId === selectedLabel;
        });
        matches = matches && hasLabel;
      }

      return matches;
    });
  }, [selectedMember, selectedPriority, selectedLabel]);

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: filterCards(column.tasks)
  }));

  if (!board || columns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có danh sách nào</h3>
          <p className="text-muted-foreground text-center mb-6">
            Board này chưa có danh sách công việc
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 px-2">
      {filteredColumns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          draggedTask={draggedTask}
          draggedList={draggedList}
          currentUserRole={currentUserRole}
          isLoadingCards={isLoadingCards}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onAddTask={openAddTask}
          onDragStart={handleDragStart}
          onDragEnd={() => setDraggedTask(null)}
          onEditTask={openEditTask}
          onDeleteTask={confirmDeleteTask}
          onCardClick={openCardDetail}
          getPriorityColor={getPriorityColor}
          getColumnBorderColor={getColumnBorderColor}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onListDragStart={handleListDragStart}
          onListDragOver={handleListDragOver}
          onListDrop={handleListDrop}
        />
      ))}

      {currentUserRole && ['owner', 'leader'].includes(currentUserRole) && (
        <div className="flex-shrink-0 w-80">
          <Card className="h-full bg-muted/20 border-2 border-dashed hover:border-primary/50 transition-all cursor-pointer" onClick={() => setIsAddListOpen(true)}>
            <CardContent className="flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Thêm danh sách mới</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <TaskFormDialog
        isOpen={isAddTaskOpen}
        isEditMode={false}
        title={title}
        description={description}
        priority={priority}
        startDate={startDate}
        dueDate={dueDate}
        selectedAssignees={selectedAssignees}
        selectedLabels={selectedLabels}
        boardMembers={boardMembers}
        boardLabels={boardLabels}
        isLoadingMembers={isLoadingMembers}
        isLoadingLabels={isLoadingLabels}
        isCreating={isCreating}
        isUpdating={false}
        onClose={handleCloseDialog}
        onSubmit={handleCreateTask}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPriorityChange={setPriority}
        onStartDateChange={setStartDate}
        onDueDateChange={setDueDate}
        onAssigneesChange={setSelectedAssignees}
        onLabelsChange={setSelectedLabels}
      />

      <TaskFormDialog
        isOpen={isEditTaskOpen}
        isEditMode={true}
        title={title}
        description={description}
        priority={priority}
        startDate={startDate}
        dueDate={dueDate}
        selectedAssignees={selectedAssignees}
        selectedLabels={selectedLabels}
        boardMembers={boardMembers}
        boardLabels={boardLabels}
        isLoadingMembers={isLoadingMembers}
        isLoadingLabels={isLoadingLabels}
        isCreating={false}
        isUpdating={isUpdating}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateTask}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPriorityChange={setPriority}
        onStartDateChange={setStartDate}
        onDueDateChange={setDueDate}
        onAssigneesChange={setSelectedAssignees}
        onLabelsChange={setSelectedLabels}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa card</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn chuyển card "<span className="font-semibold text-foreground">{taskToDelete?.task?.title}</span>" vào thùng rác?
              <br/><br/>
              Hành động này sẽ chuyển card vào thùng rác, nơi bạn có thể khôi phục hoặc xóa vĩnh viễn sau đó.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCommentDialogOpen} onOpenChange={setDeleteCommentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeleteComment} disabled={isDeletingComment}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={isDeletingComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingComment ? "Đang xóa..." : "Xóa bình luận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDetailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent className="sm:max-w-[650px]">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <div className="h-12 w-12 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải thông tin card...</p>
              </div>
            </div>
          ) : selectedCard ? (
            <>
              <DialogHeader className="space-y-2 pb-4 border-b">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <DialogTitle className="text-xl font-bold leading-tight">{selectedCard.title}</DialogTitle>
                    <DialogDescription className="sr-only">
                      Chi tiết thẻ công việc {selectedCard.title}
                    </DialogDescription>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{selectedCard.id?.slice(0, 8)}
                      </Badge>
                      {selectedCard.list && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedCard.list.name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(selectedCard.priority)}`} />
                        <span className="text-xs text-muted-foreground capitalize">
                          {selectedCard.priority === 'high' && 'Cao'}
                          {selectedCard.priority === 'medium' && 'Trung bình'}
                          {selectedCard.priority === 'low' && 'Thấp'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(85vh-180px)]">
                <div className="space-y-5 py-4 pr-4">
                  {selectedCard.description && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Mô tả</span>
                      </div>
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedCard.description}</p>
                      </div>
                    </div>
                  )}

                  {(selectedCard.startDate || selectedCard.dueDate) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Thời gian</span>
                      </div>
                      <div className="space-y-2">
                        {selectedCard.startDate && (
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground min-w-[90px]">Ngày bắt đầu:</span>
                            <span className="font-medium">
                              {format(new Date(selectedCard.startDate), "dd/MM/yyyy")}
                            </span>
                          </div>
                        )}
                        {selectedCard.dueDate && (
                          <div className="flex items-center gap-3 text-sm">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground min-w-[90px]">Hạn chót:</span>
                            <span className="font-medium">
                              {format(new Date(selectedCard.dueDate), "dd/MM/yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCard.members && selectedCard.members.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Thành viên ({selectedCard.members.length})</span>
                      </div>
                      <div className="space-y-2">
                        {selectedCard.members.map((member) => (
                          <div key={member.userId} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={member.user?.avatar} />
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {member.user?.fullName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.user?.fullName || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCard.labels && selectedCard.labels.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>Nhãn ({selectedCard.labels.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCard.labels.map((labelItem, index) => {
                          const labelData = labelItem.label || labelItem;
                          const labelId = labelItem.labelId || labelItem.id || index;

                          return (
                            <Badge
                              key={labelId}
                              variant="outline"
                              className="px-3 py-1"
                              style={{
                                backgroundColor: labelData.color ? `${labelData.color}20` : undefined,
                                borderColor: labelData.color || undefined,
                                color: labelData.color || undefined
                              }}
                            >
                              {labelData.name || 'Label'}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>Bình luận ({comments.length})</span>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Thêm bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleAddComment();
                          }
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Nhấn Ctrl+Enter để gửi</p>
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={isAddingComment || !newComment.trim()}
                        >
                          <Send className="mr-2 h-3.5 w-3.5" />
                          {isAddingComment ? "Đang gửi..." : "Gửi"}
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 border">
                                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                    {comment.author?.fullName?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{comment.author?.fullName || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm")}
                                  </p>
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => confirmDeleteComment(comment)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Xóa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {editingCommentId === comment.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  className="min-h-[60px] resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateComment(comment.id)}
                                  >
                                    Lưu
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditingCommentText("");
                                    }}
                                  >
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap pl-9">
                                {comment.bodyMd}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có bình luận nào
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t space-y-1 text-xs text-muted-foreground">
                    <p>Tạo lúc: {format(new Date(selectedCard.createdAt), "dd/MM/yyyy HH:mm")}</p>
                    <p>Cập nhật: {format(new Date(selectedCard.updatedAt), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                </div>
              </ScrollArea>

              {currentUserRole && currentUserRole !== 'guest' && (
                <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCloseDetail();
                      openEditTask(
                        {
                          id: selectedCard.id,
                          title: selectedCard.title,
                          description: selectedCard.description,
                          priority: selectedCard.priority
                        },
                        selectedCard.listId
                      );
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  {['owner', 'leader'].includes(currentUserRole) && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleCloseDetail();
                        confirmDeleteTask(
                          {
                            id: selectedCard.id,
                            title: selectedCard.title
                          },
                          selectedCard.listId
                        );
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Không tìm thấy thông tin card</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ListFormDialog
        isOpen={isAddListOpen}
        onClose={() => setIsAddListOpen(false)}
        onSubmit={handleCreateList}
        isEditMode={false}
        isLoading={isListOperating}
      />

      <ListFormDialog
        isOpen={isEditListOpen}
        onClose={() => {
          setIsEditListOpen(false);
          setEditingList(null);
        }}
        onSubmit={handleUpdateList}
        isEditMode={true}
        initialName={editingList?.title || ""}
        isLoading={isListOperating}
      />

      <DeleteListDialog
        isOpen={deleteListDialogOpen}
        onClose={() => {
          setDeleteListDialogOpen(false);
          setListToDelete(null);
        }}
        onConfirm={handleConfirmDeleteList}
        listName={listToDelete?.title || ""}
        cardCount={listToDelete?.tasks?.length || 0}
        availableLists={columns.filter(col => col.id !== listToDelete?.id)}
        isLoading={isListOperating}
      />
    </div>
  );
}
