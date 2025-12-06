const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // --- ADDED LOGIC FOR QUERY PARAMETERS ---
    if (options.method === "GET" && options.params) {
      const query = new URLSearchParams(options.params).toString();
      if (query) {
        url = `${url}?${query}`;
      }
      // Remove params from options so it's not passed to fetch directly (which doesn't use it for GET)
      delete options.params; 
    }
    // --- END ADDED LOGIC ---

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
          console.log(`[Auth Refresh] Received 401 for endpoint: ${endpoint}. Starting refresh process.`);

          if (isRefreshing) {
            console.log("[Auth Refresh] Another request queued while refresh is in progress.");
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              console.log("[Auth Refresh] Queued request is being retried with new token.");
              if (token) {
                headers["Authorization"] = `Bearer ${token}`;
                return this.request(endpoint, { ...options, headers }, true);
              }
            });
          }

          isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            console.log("[Auth Refresh] Retrieved refreshToken from localStorage:", refreshToken ? 'Exists' : 'null');
            if (!refreshToken) throw new Error("No refresh token in localStorage");

            console.log("[Auth Refresh] Sending request to /auth/refresh...");
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            console.log("[Auth Refresh] Refresh request finished. Status:", refreshResponse.status);

            if (!refreshResponse.ok) {
              const errorData = await refreshResponse.text();
              throw new Error(`Failed to refresh token. Status: ${refreshResponse.status}. Body: ${errorData}`);
            }

            const refreshData = await refreshResponse.json();
            const newToken = refreshData.accessToken || refreshData.token;
            const newRefresh = refreshData.refreshToken;

            if (!newToken) throw new Error("Invalid refresh response: new token is missing.");
            console.log("[Auth Refresh] Successfully received new tokens.");

            localStorage.setItem("token", newToken);
            if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

            console.log("[Auth Refresh] Processing queued requests.");
            processQueue(null, newToken);
            isRefreshing = false;

            headers["Authorization"] = `Bearer ${newToken}`;
            return this.request(endpoint, { ...options, headers }, true);
          } catch (refreshError) {
            console.error("[Auth Refresh] CRITICAL: Token refresh failed:", refreshError);
            processQueue(refreshError, null);
            isRefreshing = false;

            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            // Only redirect if not already on the auth page
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
