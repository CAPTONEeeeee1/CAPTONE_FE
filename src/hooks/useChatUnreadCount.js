import { useState, useEffect } from 'react';
import chatService from '@/services/chatService';
import chatSocketService from '@/services/chatSocketService';

export function useChatUnreadCount(workspaceId) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId) {
            setIsLoading(false);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                setIsLoading(true);
                const response = await chatService.getChatByWorkspace(workspaceId);
                setUnreadCount(response.unreadCount || 0);
            } catch (error) {
                console.error('Lỗi tải số tin nhắn chưa đọc:', error);
                setUnreadCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUnreadCount();

        const token = localStorage.getItem('token');
        if (token && !chatSocketService.isConnected) {
            chatSocketService.connect(token);
        }

        const handleNewMessage = (message) => {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (message.senderId !== currentUser.id) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        chatSocketService.onNewMessage(handleNewMessage);

        return () => {
            chatSocketService.offNewMessage(handleNewMessage);
        };
    }, [workspaceId]);

    const markAsRead = () => {
        setUnreadCount(0);
    };

    return { unreadCount, isLoading, markAsRead };
}
