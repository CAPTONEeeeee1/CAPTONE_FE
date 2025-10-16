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

        if (token) {
            localStorage.setItem('token', token);
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

        if (token) {
            localStorage.setItem('token', token);
        }

        return response;
    },    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('token');
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
