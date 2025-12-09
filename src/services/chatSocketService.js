import { io } from 'socket.io-client';

class ChatSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Lấy base URL (bỏ /api nếu có)
        const baseUrl = apiUrl.replace(/\/api$/, '');
        const socketUrl = `${baseUrl}/chat`;

        console.log('Connecting to socket:', socketUrl);

        this.socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket chat đã kết nối:', this.socket.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket chat đã ngắt kết nối:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Lỗi kết nối socket:', error.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    joinChat(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('join_chat', { chatId });
        }
    }

    leaveChat(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('leave_chat', { chatId });
        }
    }

    sendMessage(chatId, content, messageType = 'text', replyToId = null) {
        if (this.socket?.connected) {
            this.socket.emit('send_message', {
                chatId,
                content,
                messageType,
                replyToId,
            });
        }
    }

    typing(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { chatId });
        }
    }

    stopTyping(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('stop_typing', { chatId });
        }
    }

    markAsRead(chatId) {
        if (this.socket?.connected) {
            this.socket.emit('mark_as_read', { chatId });
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    onMessageUpdated(callback) {
        if (this.socket) {
            this.socket.on('message_updated', callback);
        }
    }

    onMessageDeleted(callback) {
        if (this.socket) {
            this.socket.on('message_deleted', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    onUserStopTyping(callback) {
        if (this.socket) {
            this.socket.on('user_stop_typing', callback);
        }
    }

    onError(callback) {
        if (this.socket) {
            this.socket.on('error', callback);
        }
    }

    offNewMessage(callback) {
        if (this.socket) {
            this.socket.off('new_message', callback);
        }
    }

    offMessageUpdated(callback) {
        if (this.socket) {
            this.socket.off('message_updated', callback);
        }
    }

    offMessageDeleted(callback) {
        if (this.socket) {
            this.socket.off('message_deleted', callback);
        }
    }

    offUserTyping(callback) {
        if (this.socket) {
            this.socket.off('user_typing', callback);
        }
    }

    offUserStopTyping(callback) {
        if (this.socket) {
            this.socket.off('user_stop_typing', callback);
        }
    }

    offError(callback) {
        if (this.socket) {
            this.socket.off('error', callback);
        }
    }
}

export default new ChatSocketService();
