import api from "@/lib/api";

const reportService = {
  getUserDashboardReport: async () => {
    const response = await api.get("/reports/user");
    return response;
  },
  getOverview: async () => {
    const response = await api.get("/reports/overview");
    return response;
  },
  getWorkspaceReport: async (workspaceId) => {
    const response = await api.get(`/reports/workspaces/${workspaceId}`);
    return response;
  },
};

export default reportService;
