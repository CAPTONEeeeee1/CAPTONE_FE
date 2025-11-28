import api from "@/lib/api";

const reportService = {
  getGlobalReport: async () => {
    const response = await api.get("/reports/global");
    return response;
  },
};

export default reportService;
