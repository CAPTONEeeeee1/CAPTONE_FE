import apiClient from "./api";

function normalizeEmail(email) {
  if (!email) return email;
  const parts = email.split("@");
  if (parts.length !== 2 || parts[1].toLowerCase() !== "gmail.com") {
    return email.trim().toLowerCase();
  }
  const localPart = parts[0].replace(/\./g, "");
  return `${localPart}@${parts[1].toLowerCase()}`;
}

const authService = {
  async register(userData) {
    const response = await apiClient.post("/auth/register", {
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      fullName: userData.fullName.trim(),
      phone: userData.phone.trim(),
    });

    const token =
      response.accessToken ||
      response.token ||
      response.data?.accessToken ||
      response.data?.token;

    const refreshToken =
      response.refreshToken || response.data?.refreshToken;

    const user = response.user || response.data?.user;

    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    return response;
  },

  async login(credentials) {
    const response = await apiClient.post("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const token =
      response.accessToken ||
      response.token ||
      response.data?.accessToken ||
      response.data?.token;

    const refreshToken =
      response.refreshToken || response.data?.refreshToken;

    const user = response.user || response.data?.user;

    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    return response;
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");

    try {
      const response = await apiClient.post("/auth/refresh", { refreshToken });

      const newToken =
        response.accessToken ||
        response.token ||
        response.data?.accessToken ||
        response.data?.token;

      const newRefresh =
        response.refreshToken || response.data?.refreshToken;

      if (newToken) localStorage.setItem("token", newToken);
      if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

      return response;
    } catch (error) {
      console.error("Refresh token failed:", error);
      this.logout();
      return Promise.reject(error);
    }
  },

  async verifyOtp(otp, email) {
    const response = await apiClient.post("/auth/verify-otp", {
      otp,
      email: normalizeEmail(email),
    });

    const token =
      response.accessToken ||
      response.token ||
      response.data?.accessToken ||
      response.data?.token;

    const refreshToken =
      response.refreshToken || response.data?.refreshToken;

    const user = response.user || response.data?.user;

    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    return response;
  },

  async sendPasswordResetCode(email) {
    return apiClient.post("/auth/send-reset-code", {
      email: normalizeEmail(email),
    });
  },

  async resetPassword(data) {
    const payload = { ...data, email: normalizeEmail(data.email) };
    return apiClient.post("/auth/reset-password", payload);
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.warn("Logout warning:", err.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = "/auth";
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
