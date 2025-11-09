import apiClient from '@/lib/api';

/**
 * Workspace Service
 * Handles all workspace-related API calls
 */
const workspaceService = {
    /**
     * Create a new workspace
     * @param {Object} workspaceData - Workspace information
     * @param {string} workspaceData.name - Workspace name (required)
     * @param {string} workspaceData.description - Workspace description (optional)
     * @returns {Promise<Object>} Created workspace
     */
    async create(workspaceData) {
        return await apiClient.post('/api/workspaces', {
            name: workspaceData.name,
            description: workspaceData.description || '',
        });
    },

    /**
     * Get all workspaces for current user
     * @returns {Promise<Array>} List of workspaces
     */
    async getAll() {
        return await apiClient.get('/api/workspaces');
    },

    /**
     * Get workspace by ID
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Object>} Workspace details
     */
    async getById(workspaceId) {
        return await apiClient.get(`/api/boards/workspace/${workspaceId}`);
    },

    /**
     * Update workspace
     * @param {string} workspaceId - Workspace ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated workspace
     */
    async update(workspaceId, updateData) {
        return await apiClient.put(`/api/workspaces/${workspaceId}`, updateData);
    },

    /**
     * Delete workspace
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Object>} Delete confirmation
     */
    async delete(workspaceId) {
        return await apiClient.delete(`/api/workspaces/${workspaceId}`);
    },

    /**
     * Get boards for a specific workspace
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Object>} Boards data with list of boards
     */
    async getBoards(workspaceId) {
        return await apiClient.get(`/api/boards/workspace/${workspaceId}`);
    },

    /**
     * Invite a member to workspace
     * @param {string} workspaceId - Workspace ID
     * @param {Object} inviteData - Invitation data
     * @param {string} inviteData.email - Email of user to invite (required)
     * @param {string} inviteData.role - Role to assign (optional, default: 'member')
     * @returns {Promise<Object>} Created invitation data
     */
    async inviteMember(workspaceId, inviteData) {
        return await apiClient.post(`/api/workspaces/${workspaceId}/invite`, {
            email: inviteData.email,
            role: inviteData.role || 'member',
        });
    },

    /**
     * Get all members of a workspace
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Array>} List of workspace members with user details
     */
    async getMembers(workspaceId) {
        return await apiClient.get(`/api/workspaces/${workspaceId}/members`);
    },

    /**
     * Remove a member from workspace
     * @param {string} workspaceId - Workspace ID
     * @param {string} userId - User ID to remove
     * @returns {Promise<Object>} Success message
     */
    async removeMember(workspaceId, userId) {
        return await apiClient.delete(`/api/workspaces/${workspaceId}/member/${userId}`);
    },

    /**
     * Update member role in workspace
     * @param {string} workspaceId - Workspace ID
     * @param {string} userId - User ID to update
     * @param {string} role - New role (admin, member, guest)
     * @returns {Promise<Object>} Updated member
     */
    async updateMemberRole(workspaceId, userId, role) {
        return await apiClient.patch(`/api/workspaces/${workspaceId}/member/${userId}/role`, { role });
    },

    /**
     * Leave a workspace (for non-owner members)
     * @param {string} workspaceId - Workspace ID
     * @returns {Promise<Object>} Success message
     */
    async leaveWorkspace(workspaceId) {
        return await apiClient.post(`/api/workspaces/${workspaceId}/leave`);
    },

    /**
     * Get all pending invitations for current user
     * @returns {Promise<Array>} List of pending invitations
     */
    async getMyInvitations() {
        return await apiClient.get('/api/workspaces/invitations');
    },

    /**
     * Accept a workspace invitation
     * @param {string} invitationId - Invitation ID
     * @returns {Promise<Object>} Success message
     */
    async acceptInvitation(invitationId) {
        return await apiClient.post(`/api/workspaces/invitations/${invitationId}/accept`);
    },

    /**
     * Reject a workspace invitation
     * @param {string} invitationId - Invitation ID
     * @returns {Promise<Object>} Success message
     */
    async rejectInvitation(invitationId) {
        return await apiClient.post(`/api/workspaces/invitations/${invitationId}/reject`);
    },
};

export default workspaceService;
