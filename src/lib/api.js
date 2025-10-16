// Base API configuration
const API_BASE_URL = 'http://localhost:3000';

/**
 * API Client for making HTTP requests
 */
const apiClient = {
    /**
     * Make a request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}) {
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
