import api from "@/lib/api";

const reportService = {
  getUserDashboardReport: async () => {
    const response = await api.get("/reports/user");
    return response;
  },
};

export default reportService;
