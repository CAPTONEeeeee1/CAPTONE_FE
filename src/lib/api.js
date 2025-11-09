// Base API configuration
const API_BASE_URL = 'http://localhost:3000';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * API Client for making HTTP requests
 */
const apiClient = {
    /**
     * Make a request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @param {boolean} isRetry - Is this a retry after token refresh
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}, isRetry = false) {
        const url = `${API_BASE_URL}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add auth token if exists
        const token = localStorage.getItem('token');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: defaultHeaders,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized
                if (response.status === 401 && !isRetry && endpoint !== '/api/auth/refresh') {
                    if (isRefreshing) {
                        // Wait for the token to be refreshed
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(() => {
                            return this.request(endpoint, options, true);
                        });
                    }

                    isRefreshing = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (!refreshToken) {
                            throw new Error('No refresh token');
                        }

                        // Refresh token
                        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken })
                        });

                        if (!refreshResponse.ok) {
                            throw new Error('Failed to refresh token');
                        }

                        const refreshData = await refreshResponse.json();
                        const newToken = refreshData.accessToken || refreshData.token;
                        const newRefreshToken = refreshData.refreshToken;

                        if (newToken) {
                            localStorage.setItem('token', newToken);

                            // Update refresh token if provided (token rotation)
                            if (newRefreshToken) {
                                localStorage.setItem('refreshToken', newRefreshToken);
                            }

                            processQueue(null, newToken);
                            isRefreshing = false;

                            // Retry original request with new token
                            return this.request(endpoint, options, true);
                        } else {
                            throw new Error('No token in refresh response');
                        }
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        isRefreshing = false;

                        // Clear tokens and redirect to login
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');

                        // Redirect to login page
                        if (window.location.pathname !== '/auth') {
                            window.location.href = '/auth';
                        }

                        throw {
                            status: 401,
                            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
                            data: null,
                        };
                    }
                }

                throw {
                    status: response.status,
                    message: data.message || 'Something went wrong',
                    data: data,
                };
            }

            return data;
        } catch (error) {
            // If it's already our formatted error, throw it
            if (error.status) {
                throw error;
            }
            // Network or parsing error
            throw {
                status: 0,
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                data: null,
            };
        }
    },

    /**
     * Make a GET request
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'GET',
        });
    },

    /**
     * Make a POST request
     */
    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Make a PUT request
     */
    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Make a DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE',
        });
    },

    /**
     * Make a PATCH request
     */
    patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
};

export default apiClient;
export { API_BASE_URL };
