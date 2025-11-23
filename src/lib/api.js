const API_BASE_URL = "http://localhost:3000";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const apiClient = {

  async request(endpoint, options = {}, isRetry = false) {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 401 && !isRetry && endpoint !== "/auth/refresh") {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (token) {
                headers["Authorization"] = `Bearer ${token}`;
                return this.request(endpoint, { ...options, headers }, true);
              }
            });
          }

          isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");

            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) throw new Error("Failed to refresh token");

            const refreshData = await refreshResponse.json();
            const newToken = refreshData.accessToken || refreshData.token;
            const newRefresh = refreshData.refreshToken;

            if (!newToken) throw new Error("Invalid refresh response");

            localStorage.setItem("token", newToken);
            if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

            processQueue(null, newToken);
            isRefreshing = false;

            headers["Authorization"] = `Bearer ${newToken}`;
            return this.request(endpoint, { ...options, headers }, true);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            if (window.location.pathname !== "/auth") {
              window.location.href = "/auth";
            }

            throw {
              status: 401,
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
              data: null,
            };
          }
        }

        throw {
          status: response.status,
          message: data.error || data.message || "Đã xảy ra lỗi khi xử lý yêu cầu.",
          data,
        };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;

      console.error("API Client Error:", error);
      throw {
        status: 0,
        message: "Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.",
        data: null,
      };
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default apiClient;
export { API_BASE_URL };
