import apiClient from './api';

/**
 * Authentication Service
 * Handles all authentication related API calls
 */
const authService = {
    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} Response with token and user data
     */
    async register(userData) {
        const response = await apiClient.post('/api/auth/register', {
            email: userData.email.trim().toLowerCase(),
            password: userData.password,
            fullName: userData.fullName.trim(),
            phone: userData.phone.trim()
        });

        const token = response.token ||
            response.accessToken ||
            response.data?.token ||
            response.data?.accessToken;

        const refreshToken = response.refreshToken ||
            response.data?.refreshToken;

        const user = response.user || response.data?.user;

        if (token) {
            localStorage.setItem('token', token);
        }

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }

        return response;
    },

    /**
     * Login user
     * @param {Object} credentials - User login credentials
     * @returns {Promise} Response with token and user data
     */
    async login(credentials) {
        const response = await apiClient.post('/api/auth/login', {
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password
        });

        const token = response.token ||
            response.accessToken ||
            response.data?.token ||
            response.data?.accessToken;

        const refreshToken = response.refreshToken ||
            response.data?.refreshToken;

        const user = response.user || response.data?.user;

        if (token) {
            localStorage.setItem('token', token);
        }

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }

        return response;
    },

    /**
     * Refresh access token
     * @returns {Promise} New access token
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await apiClient.post('/api/auth/refresh', {
                refreshToken
            });

            const newToken = response.accessToken ||
                response.token ||
                response.data?.accessToken ||
                response.data?.token;

            const newRefreshToken = response.refreshToken ||
                response.data?.refreshToken;

            if (newToken) {
                localStorage.setItem('token', newToken);
            }

            // Update refresh token if backend rotates it
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            return response;
        } catch (error) {
            // If refresh fails, logout user
            console.error('Refresh token failed:', error);
            this.logout();

            // Redirect to login if not already there
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }

            throw error;
        }
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    /**
     * Get current token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    }
};

export default authService;
