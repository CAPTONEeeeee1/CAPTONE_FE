import api from '../lib/api';

const getConversations = async (workspaceId) => {
    const response = await api.get(`/chat/conversations/${workspaceId}`);
    return response.data;
};

const getMessages = async (conversationId) => {
    const response = await api.get(`/chat/messages/${conversationId}`);
    return response.data;
};

const chatService = {
    getConversations,
    getMessages,
};

export default chatService;
