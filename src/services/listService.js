import apiClient from '@/lib/api';

const listService = {
    async create(boardId, name) {
        return await apiClient.post('/lists', { boardId, name });
    },

    async getByBoardId(boardId) {
        return await apiClient.get(`/lists/board/${boardId}`);
    },

    async update(listId, data) {
        return await apiClient.patch(`/lists/${listId}`, data);
    },

    async delete(listId, moveToListId = null) {
        const query = moveToListId ? `?moveToListId=${moveToListId}` : '';
        return await apiClient.delete(`/lists/${listId}${query}`);
    },

    async reorder(boardId, orders) {
        return await apiClient.post('/lists/reorder', { boardId, orders });
    }
};

export default listService;
