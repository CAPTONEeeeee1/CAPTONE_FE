import apiClient from '@/lib/api';

/**
 * User Service
 * Handles all user profile related API calls
 */
const userService = {
    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        return await apiClient.get('/auth/me');
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @param {string} profileData.fullName - Full name
     * @param {string} profileData.phone - Phone number
     * @param {string} profileData.avatar - Avatar URL
     * @param {string} profileData.description - User description/bio
     * @returns {Promise<Object>} Updated user profile
     */
    async updateProfile(profileData) {
        const data = {};

        if (profileData.fullName !== undefined) {
            data.fullName = profileData.fullName.trim();
        }

        if (profileData.phone !== undefined) {
            data.phone = profileData.phone ? profileData.phone.trim() : null;
        }

        if (profileData.avatar !== undefined) {
            data.avatar = profileData.avatar || null;
        }

        if (profileData.description !== undefined) {
            data.description = profileData.description ? profileData.description.trim() : null;
        }

        return await apiClient.patch('/auth/me', data);
    },

    /**
     * Change user password
     * @param {Object} passwordData - Password data
     * @param {string} passwordData.currentPassword - Current password
     * @param {string} passwordData.newPassword - New password
     * @param {string} passwordData.confirmPassword - Confirm new password
     * @returns {Promise<Object>} Success message
     */
    async changePassword(passwordData) {
        return await apiClient.post('/auth/change-password', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword
        });
    }
};

export default userService;