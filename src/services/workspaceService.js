import apiClient from '@/lib/api';

const workspaceService = {
    /**
     * Lấy tất cả workspaces của người dùng hiện tại
     * @returns {Promise<Object>} Đối tượng chứa mảng workspaces
     */
    async getAll() {
        // SỬA LỖI: Trả về toàn bộ đối tượng response để component có thể truy cập response.workspaces
        return apiClient.get('/workspaces');
    },

    /**
     * Lấy thông tin chi tiết của một workspace
     * @param {string} id - ID của workspace
     * @returns {Promise<Object>} Đối tượng chứa thông tin workspace
     */
    async getById(id) {
        return apiClient.get(`/workspaces/${id}`);
    },

    /**
     * Tạo một workspace mới
     * @param {Object} workspaceData - Dữ liệu của workspace mới (name, description)
     * @returns {Promise<Object>} Workspace vừa được tạo
     */
    async create(workspaceData) {
        return apiClient.post('/workspaces', workspaceData);
    },

    /**
     * Xóa một workspace
     * @param {string} id - ID của workspace cần xóa
     * @returns {Promise<Object>}
     */
    async delete(id) {
        return apiClient.delete(`/workspaces/${id}`);
    },

    /**
     * Lấy danh sách boards của một workspace
     * @param {string} workspaceId - ID của workspace
     * @returns {Promise<Object>} Đối tượng chứa mảng boards
     */
    async getBoards(workspaceId) {
        return apiClient.get(`/workspaces/${workspaceId}/boards`);
    },

    /**
     * Lấy danh sách thành viên của một workspace
     * @param {string} workspaceId - ID của workspace
     * @returns {Promise<Object>} Đối tượng chứa mảng members
     */
    async getMembers(workspaceId) {
        return apiClient.get(`/workspaces/${workspaceId}/members`);
    },

    /**
     * Mời thành viên mới vào workspace
     * @param {string} workspaceId - ID của workspace
     * @param {Object} data - Chứa email và role
     * @returns {Promise<Object>}
     */
    async inviteMember(workspaceId, { email, role }) {
        return apiClient.post(`/workspaces/${workspaceId}/invitations`, { email, role });
    },

    /**
     * Xóa thành viên khỏi workspace
     * @param {string} workspaceId - ID của workspace
     * @param {Object} data - Chứa memberId
     * @returns {Promise<Object>}
     */
    async removeMember(workspaceId, { memberId }) {
        return apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    },

    /**
     * Cập nhật vai trò của thành viên
     * @param {string} workspaceId - ID của workspace
     * @param {Object} data - Chứa memberId và role
     * @returns {Promise<Object>}
     */
    async updateMemberRole(workspaceId, { memberId, role }) {
        return apiClient.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role });
    },

    /**
     * Lấy danh sách lời mời của người dùng hiện tại
     * @returns {Promise<Object>}
     */
    async getMyInvitations() {
        return apiClient.get('/workspaces/invitations/me');
    },

    /**
     * Chấp nhận lời mời tham gia workspace
     * @param {string} invitationId - ID của lời mời
     * @returns {Promise<Object>}
     */
    async acceptInvitation(invitationId) {
        return apiClient.post(`/workspaces/invitations/${invitationId}/accept`);
    },

    /**
     * Từ chối lời mời tham gia workspace
     * @param {string} invitationId - ID của lời mời
     * @returns {Promise<Object>}
     */
    async rejectInvitation(invitationId) {
        return apiClient.post(`/workspaces/invitations/${invitationId}/reject`);
    },

    /**
     * Rời khỏi một workspace
     * @param {string} workspaceId - ID của workspace
     * @returns {Promise<Object>}
     */
    async leaveWorkspace(workspaceId) {
        return apiClient.post(`/workspaces/${workspaceId}/leave`);
    },
};

export default workspaceService;