import apiClient from '@/lib/api';

/**
 * Notification Service
 * Handles all notification related API calls
 */
const notificationService = {
    /**
     * Get all notifications for current user
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @param {boolean} params.unreadOnly - Filter unread only
     * @returns {Promise<Object>} Notifications with pagination
     */
    async getNotifications(params = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            unreadOnly: unreadOnly.toString()
        });

        return await apiClient.get(`/notifications?${queryParams}`);
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Updated notification
     */
    async markAsRead(notificationId) {
        return await apiClient.put(`/notifications/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     * @returns {Promise<Object>} Success message
     */
    async markAllAsRead() {
        return await apiClient.put('/notifications/read-all');
    },

    /**
     * Delete a notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Success message
     */
    async deleteNotification(notificationId) {
        return await apiClient.delete(`/notifications/${notificationId}`);
    },

    /**
     * Get unread notifications count
     * @returns {Promise<Object>} Unread count
     */
    async getUnreadCount() {
        return await apiClient.get('/notifications/unread-count');
    },

    /**
     * Get notification settings
     * @returns {Promise<Object>} Notification settings
     */
    async getSettings() {
        return await apiClient.get('/notifications/settings');
    },

    /**
     * Update notification settings
     * @param {Object} settings - Settings to update
     * @param {boolean} settings.emailNotifications - Enable email notifications
     * @param {boolean} settings.taskAssignedEmail - Email on task assigned
     * @param {boolean} settings.workspaceInviteEmail - Email on workspace invite
     * @param {boolean} settings.invitationResponseEmail - Email on invitation response
     * @returns {Promise<Object>} Updated settings
     */
    async updateSettings(settings) {
        return await apiClient.put('/notifications/settings', settings);
    }
};

export default notificationService;
