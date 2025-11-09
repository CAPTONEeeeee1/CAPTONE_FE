import apiClient from '@/lib/api';

/**
 * Card Service
 * Handles all card-related API calls
 */
const cardService = {
    /**
     * Create a new card
     * @param {Object} cardData - Card information
     * @param {string} cardData.boardId - Board ID (required)
     * @param {string} cardData.listId - List ID (required)
     * @param {string} cardData.title - Card title (required)
     * @param {string} cardData.description - Card description (optional)
     * @param {string} cardData.priority - Card priority: low|medium|high (optional)
     * @param {string} cardData.dueDate - Card due date (optional)
     * @param {string} cardData.startDate - Card start date (optional)
     * @param {Array<string>} cardData.assigneeIds - Array of user IDs to assign (optional)
     * @returns {Promise<Object>} Created card
     */
    async create(cardData) {
        return await apiClient.post('/api/cards', cardData);
    },

    /**
     * Get card by ID
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} Card details
     */
    async getById(cardId) {
        return await apiClient.get(`/api/cards/${cardId}`);
    },

    /**
     * Update card
     * @param {string} cardId - Card ID
     * @param {Object} updates - Card updates
     * @returns {Promise<Object>} Updated card
     */
    async update(cardId, updates) {
        return await apiClient.patch(`/api/cards/${cardId}`, updates);
    },

    /**
     * Delete card
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} Delete confirmation
     */
    async delete(cardId) {
        return await apiClient.delete(`/api/cards/${cardId}`);
    },

    /**
     * Move card to different list
     * @param {string} cardId - Card ID
     * @param {string} toListId - Target list ID
     * @param {number} toIndex - New order index
     * @returns {Promise<Object>} Updated card
     */
    async move(cardId, toListId, toIndex) {
        return await apiClient.post(`/api/cards/${cardId}/move`, { toListId, toIndex });
    },

    /**
     * Get all cards by list ID
     * @param {string} listId - List ID
     * @param {Object} params - Query parameters (optional)
     * @param {string} params.q - Search query
     * @param {string} params.labelId - Filter by label ID
     * @param {string} params.memberId - Filter by member ID
     * @param {number} params.offset - Pagination offset
     * @param {number} params.limit - Pagination limit
     * @returns {Promise<Object>} Cards with pagination info
     */
    async getByListId(listId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.labelId) queryParams.append('labelId', params.labelId);
        if (params.memberId) queryParams.append('memberId', params.memberId);
        if (params.offset !== undefined) queryParams.append('offset', params.offset);
        if (params.limit !== undefined) queryParams.append('limit', params.limit);

        const queryString = queryParams.toString();
        const url = `/api/cards/list/${listId}${queryString ? `?${queryString}` : ''}`;
        return await apiClient.get(url);
    },

    /**
     * Assign member to card
     * @param {string} cardId - Card ID
     * @param {string} userId - User ID to assign
     * @returns {Promise<Object>} Assignment confirmation
     */
    async assignMember(cardId, userId) {
        return await apiClient.post(`/api/cards/${cardId}/assign`, { userId });
    },

    /**
     * Remove member from card
     * @param {string} cardId - Card ID
     * @param {string} userId - User ID to remove
     * @returns {Promise<Object>} Remove confirmation
     */
    async removeMember(cardId, userId) {
        return await apiClient.delete(`/api/cards/${cardId}/member/${userId}`);
    },

    /**
     * Get card attachments
     * @param {string} cardId - Card ID
     * @returns {Promise<Object>} Attachments list
     */
    async getAttachments(cardId) {
        return await apiClient.get(`/api/cards/${cardId}/attachments`);
    },

    /**
     * Delete card attachment
     * @param {string} cardId - Card ID
     * @param {string} attachmentId - Attachment ID
     * @returns {Promise<Object>} Delete confirmation
     */
    async deleteAttachment(cardId, attachmentId) {
        return await apiClient.delete(`/api/cards/${cardId}/attachments/${attachmentId}`);
    },
};

export default cardService;
