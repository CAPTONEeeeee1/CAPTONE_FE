import apiClient from "./api";

const adminService = {
  async getStats() {
    return apiClient.get("/admin/stats");
  },

  async getUsers({ page = 1, limit = 20, search } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    return apiClient.get(`/admin/users?${params.toString()}`);
  },

  async getUserDetail(userId) {
    return apiClient.get(`/admin/users/${userId}`);
  },

  async updateUserStatus(userId, status) {
    return apiClient.put(`/admin/users/${userId}/status`, { status });
  },

  async updateUserRole(userId, role) {
    return apiClient.put(`/admin/users/${userId}/role`, { role });
  },

  async updateUserInfo(userId, data) {
    return apiClient.put(`/admin/users/${userId}/info`, data);
  },

  async deleteUser(userId) {
    return apiClient.delete(`/admin/users/${userId}`);
  },
};

export default adminService;
