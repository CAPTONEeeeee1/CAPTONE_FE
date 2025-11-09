import apiClient from '@/lib/api';

/**
 * Board Service
 * Handles all board-related API calls
 */
const boardService = {
    /**
     * Create a new board
     * @param {Object} boardData - Board information
     * @param {string} boardData.workspaceId - Workspace ID (required)
     * @param {string} boardData.name - Board name (required)
     * @param {string} boardData.description - Board description (optional)
     * @param {string} boardData.mode - Board mode: private|workspace|public (optional)
     * @returns {Promise<Object>} Created board with lists
     */
    async create(boardData) {
        return await apiClient.post('/api/boards', boardData);
    },

    /**
     * Get board by ID
     * @param {string} boardId - Board ID
     * @returns {Promise<Object>} Board details
     */
    async getById(boardId) {
        return await apiClient.get(`/api/boards/${boardId}`);
    },

    /**
     * Update board name
     * @param {string} boardId - Board ID
     * @param {string} name - New board name
     * @returns {Promise<Object>} Updated board
     */
    async rename(boardId, name) {
        return await apiClient.put(`/api/boards/${boardId}/rename`, { name });
    },

    /**
     * Delete board
     * @param {string} boardId - Board ID
     * @returns {Promise<Object>} Delete confirmation
     */
    async delete(boardId) {
        return await apiClient.delete(`/api/boards/${boardId}`);
    },
};

export default boardService;
