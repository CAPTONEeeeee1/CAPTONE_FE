import apiClient from '@/lib/api';

// Get trashed boards in workspace
export const getTrashedBoards = async (workspaceId) => {
    return await apiClient.get(`/trash/workspace/${workspaceId}/boards`);
};

// Restore board from trash
export const restoreBoard = async (boardId) => {
    return await apiClient.post(`/trash/board/${boardId}/restore`);
};

// Permanently delete board
export const permanentlyDeleteBoard = async (boardId) => {
    return await apiClient.delete(`/trash/board/${boardId}/permanent`);
};

// Get all trashed cards in workspace
export const getTrashedCardsInWorkspace = async (workspaceId) => {
    return await apiClient.get(`/trash/workspace/${workspaceId}/cards`);
};

// Get trashed cards in board
export const getTrashedCards = async (boardId) => {
    return await apiClient.get(`/trash/board/${boardId}/cards`);
};

// Restore card from trash
export const restoreCard = async (cardId) => {
    return await apiClient.post(`/trash/card/${cardId}/restore`);
};

// Permanently delete card
export const permanentlyDeleteCard = async (cardId) => {
    return await apiClient.delete(`/trash/card/${cardId}/permanent`);
};
