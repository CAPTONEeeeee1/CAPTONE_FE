import apiClient from './api';

const searchCards = async (params) => {
    try {
        const response = await apiClient.get('/search/cards', { params });
        return response.results;
    } catch (error) {
        console.error('Error searching cards:', error);
        throw error;
    }
};

const searchWorkspaces = async (params) => {
    try {
        const response = await apiClient.get('/search/workspaces', { params });
        return response.results;
    } catch (error) {
        console.error('Error searching workspaces:', error);
        throw error;
    }
};

const searchBoards = async (params) => {
    try {
        const response = await apiClient.get('/search/boards', { params });
        return response.results;
    } catch (error) {
        console.error('Error searching boards:', error);
        throw error;
    }
};

export default {
    searchCards,
    searchWorkspaces,
    searchBoards,
};
