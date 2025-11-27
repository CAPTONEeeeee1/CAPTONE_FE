import apiClient from '../lib/api';

/**
 * Fetches the user's current notification settings.
 * @returns {Promise<object>} The settings object.
 */
export const getSettings = async () => {
  try {
    const data = await apiClient.get('/settings');
    return data;
  } catch (error) {
    console.error('Failed to get notification settings:', error);
    throw error;
  }
};

/**
 * Updates the user's notification settings.
 * @param {object} settings - The new settings object.
 * @returns {Promise<object>} The updated settings object.
 */
export const updateSettings = async (settings) => {
  try {
    const { data } = await apiClient.put('/settings', settings);
    return data;
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error;
  }
};

const settingService = {
  getSettings,
  updateSettings,
};

export default settingService;
