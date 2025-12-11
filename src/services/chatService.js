import apiClient from '@/lib/api';

const chatService = {
    async getChatByWorkspace(workspaceId) {
        return apiClient.get(`/chat/workspace/${workspaceId}`);
    },

    async getMessages(chatId, limit = 50, cursor = null) {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/chat/${chatId}/messages`, { params });
    },

    async searchMessages(chatId, query, limit = 20) {
        return apiClient.get(`/chat/${chatId}/messages/search`, {
            params: { q: query, limit }
        });
    },

    async sendMessage(chatId, data) {
        return apiClient.post(`/chat/${chatId}/messages`, data);
    },

    async uploadAttachment(chatId, files, messageId = null, content = null, replyToId = null) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        if (messageId) formData.append('messageId', messageId);
        if (content) formData.append('content', content);
        if (replyToId) formData.append('replyToId', replyToId);

        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/${chatId}/messages/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw error;
        }

        return response.json();
    },

    async updateMessage(messageId, content) {
        return apiClient.put(`/chat/messages/${messageId}`, { content });
    },

    async deleteMessage(messageId) {
        return apiClient.delete(`/chat/messages/${messageId}`);
    },

    async markAsRead(chatId) {
        return apiClient.post(`/chat/${chatId}/read`);
    },

    async getAttachments(chatId, type = null, limit = 50, cursor = null) {
        const params = { limit };
        if (type) params.type = type;
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/chat/${chatId}/attachments`, { params });
    },

    async getMembers(chatId) {
        return apiClient.get(`/chat/${chatId}/members`);
    }
};

export default chatService;
