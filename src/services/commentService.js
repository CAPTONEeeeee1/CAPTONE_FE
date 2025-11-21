import apiClient from '@/lib/api';

/**
 * Comment Service
 * Handles all comment-related API calls
 */
const commentService = {
    /**
     * Get all comments for a card
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} Comments list with author info
     */
    async getByCardId(cardId) {
        return await apiClient.get(`/comments/${cardId}`);
    },

    /**
     * Add a new comment to a card
     * @param {string} cardId - Card ID
     * @param {Object} commentData - Comment data
     * @param {string} commentData.bodyMd - Comment content in markdown
     * @param {string} commentData.parentId - Parent comment ID for replies (optional)
     * @returns {Promise<Object>} Created comment with author info
     */
    async create(cardId, commentData) {
        return await apiClient.post(`/comments/${cardId}`, commentData);
    },

    /**
     * Update a comment
     * @param {string} commentId - Comment ID
     * @param {Object} updates - Comment updates
     * @param {string} updates.bodyMd - Updated comment content
     * @returns {Promise<Object>} Updated comment
     */
    async update(commentId, updates) {
        return await apiClient.patch(`/comments/${commentId}`, updates);
    },

    /**
     * Delete a comment
     * @param {string} commentId - Comment ID
     * @returns {Promise<Object>} Delete confirmation
     */
    async delete(commentId) {
        return await apiClient.delete(`/comments/${commentId}`);
    },
};

export default commentService;
