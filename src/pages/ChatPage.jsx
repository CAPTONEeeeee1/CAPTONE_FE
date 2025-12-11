import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import chatService from '@/services/chatService';
import chatSocketService from '@/services/chatSocketService';
import { DashboardSidebar } from '@/components/layout/dashboardSideBar';
import { DashboardHeader } from '@/components/layout/dashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Send,
    Paperclip,
    Image as ImageIcon,
    File,
    MoreVertical,
    Edit2,
    Trash2,
    Search,
    Users,
    Reply,
    X,
    Download,
    Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ChatPage() {
    const { workspaceId } = useParams();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const processingMessagesRef = useRef(new Set()); // Track messages đang được xử lý
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [members, setMembers] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [editingMessage, setEditingMessage] = useState(null);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesTopRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            chatSocketService.connect(token);
        }

        return () => {
            if (chat?.id) {
                chatSocketService.leaveChat(chat.id);
            }
            chatSocketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (workspaceId) {
            fetchChat();
        }
    }, [workspaceId]);

    useEffect(() => {
        if (chat?.id) {
            fetchMessages();
            fetchMembers();
            chatSocketService.joinChat(chat.id);
            chatSocketService.markAsRead(chat.id);

            const handleNewMessage = (message) => {
                setMessages((prev) => {
                    // Tránh duplicate: chỉ thêm nếu tin nhắn chưa tồn tại
                    if (prev.some(m => m.id === message.id)) {
                        return prev;
                    }
                    return [...prev, message];
                });
                setTimeout(() => scrollToBottom(), 100);
                if (message.senderId !== currentUser.id) {
                    chatSocketService.markAsRead(chat.id);
                }
            };

            const handleMessageUpdated = (message) => {
                // Chỉ cập nhật nếu không đang xử lý message này
                if (!processingMessagesRef.current.has(message.id)) {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === message.id ? { ...m, ...message } : m))
                    );
                }
            };

            const handleMessageDeleted = ({ messageId }) => {
                // Chỉ xóa nếu không đang xử lý message này
                if (!processingMessagesRef.current.has(messageId)) {
                    setMessages((prev) => prev.filter((m) => m.id !== messageId));
                }
            };

            const handleUserTyping = ({ userId }) => {
                if (userId !== currentUser.id) {
                    setTypingUsers((prev) => new Set(prev).add(userId));
                }
            };

            const handleUserStopTyping = ({ userId }) => {
                setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            };

            const handleError = ({ message }) => {
                toast.error(message);
            };

            chatSocketService.onNewMessage(handleNewMessage);
            chatSocketService.onMessageUpdated(handleMessageUpdated);
            chatSocketService.onMessageDeleted(handleMessageDeleted);
            chatSocketService.onUserTyping(handleUserTyping);
            chatSocketService.onUserStopTyping(handleUserStopTyping);
            chatSocketService.onError(handleError);

            return () => {
                chatSocketService.offNewMessage(handleNewMessage);
                chatSocketService.offMessageUpdated(handleMessageUpdated);
                chatSocketService.offMessageDeleted(handleMessageDeleted);
                chatSocketService.offUserTyping(handleUserTyping);
                chatSocketService.offUserStopTyping(handleUserStopTyping);
                chatSocketService.offError(handleError);
            };
        }
    }, [chat?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChat = async () => {
        try {
            setIsLoading(true);
            const response = await chatService.getChatByWorkspace(workspaceId);
            setChat(response);
        } catch (error) {
            console.error('Lỗi tải chat:', error);
            toast.error('Không thể tải chat room');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await chatService.getMessages(chat.id);
            setMessages(response.messages || []);
            setHasMoreMessages(response.hasMore || false);
            setNextCursor(response.nextCursor || null);
        } catch (error) {
            console.error('Lỗi tải tin nhắn:', error);
            toast.error('Không thể tải tin nhắn');
        }
    };

    const loadMoreMessages = async () => {
        if (!hasMoreMessages || isLoadingMore || !nextCursor) return;

        try {
            setIsLoadingMore(true);
            const response = await chatService.getMessages(chat.id, 50, nextCursor);
            setMessages((prev) => [...(response.messages || []), ...prev]);
            setHasMoreMessages(response.hasMore || false);
            setNextCursor(response.nextCursor || null);
        } catch (error) {
            console.error('Lỗi tải thêm tin nhắn:', error);
            toast.error('Không thể tải thêm tin nhắn');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await chatService.getMembers(chat.id);
            setMembers(response.members || []);
        } catch (error) {
            console.error('Lỗi tải thành viên:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() && selectedFiles.length === 0) return;

        if (editingMessage) {
            handleUpdateMessage();
            return;
        }

        try {
            setIsSending(true);

            let response;
            if (selectedFiles.length > 0) {
                setIsUploading(true);
                toast.loading(`Đang tải lên ${selectedFiles.length} file...`, { id: 'uploading' });

                response = await chatService.uploadAttachment(
                    chat.id,
                    selectedFiles,
                    null,
                    newMessage.trim() || null,
                    replyToMessage?.id
                );

                toast.dismiss('uploading');
                toast.success('Tải file thành công!');
                setSelectedFiles([]);
                setIsUploading(false);
            } else {
                response = await chatService.sendMessage(chat.id, {
                    content: newMessage.trim(),
                    messageType: 'text',
                    replyToId: replyToMessage?.id,
                });
            }

            // Không cần thêm tin nhắn vào state ở đây
            // Socket listener sẽ nhận event 'new_message' từ server và tự động cập nhật
            // Điều này đảm bảo UI được cập nhật nhất quán cho tất cả clients

            setNewMessage('');
            setReplyToMessage(null);
            chatSocketService.stopTyping(chat.id);

            // Scroll sau một chút để đợi socket update
            setTimeout(() => scrollToBottom(), 150);
        } catch (error) {
            toast.dismiss('uploading');

            let errorMessage = 'Không thể gửi tin nhắn';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message.includes('Network')) {
                errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Thời gian chờ quá lâu. File có thể quá lớn';
            }

            toast.error(errorMessage);
        } finally {
            setIsSending(false);
            setIsUploading(false);
        }
    };

    const handleUpdateMessage = async () => {
        if (!newMessage.trim()) return;

        const oldContent = editingMessage.content;
        const messageId = editingMessage.id;
        const updatedContent = newMessage.trim();
        const oldIsEdited = editingMessage.isEdited;

        // Đánh dấu message đang được xử lý
        processingMessagesRef.current.add(messageId);

        // Optimistic update - cập nhật NGAY LẬP TỨC trên UI
        setMessages((prev) =>
            prev.map((m) =>
                m.id === messageId
                    ? { ...m, content: updatedContent, isEdited: true, updatedAt: new Date().toISOString() }
                    : m
            )
        );
        setNewMessage('');
        setEditingMessage(null);

        try {
            const updatedMessage = await chatService.updateMessage(messageId, updatedContent);
            // Cập nhật lại với data từ server để đảm bảo đồng bộ
            if (updatedMessage) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === messageId ? { ...m, ...updatedMessage } : m))
                );
            }
            toast.success('Đã cập nhật tin nhắn');
        } catch (error) {
            console.error('Lỗi cập nhật tin nhắn:', error);
            toast.error('Không thể cập nhật tin nhắn');
            // Rollback về trạng thái cũ nếu lỗi
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, content: oldContent, isEdited: oldIsEdited } : m
                )
            );
        } finally {
            // Xóa khỏi danh sách đang xử lý sau 1 giây (đợi WebSocket event)
            setTimeout(() => {
                processingMessagesRef.current.delete(messageId);
            }, 1000);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        // Lưu message để rollback nếu cần
        const deletedMessage = messages.find((m) => m.id === messageId);
        if (!deletedMessage) return;

        // Đánh dấu message đang được xử lý
        processingMessagesRef.current.add(messageId);

        // Optimistic update - XÓA NGAY LẬP TỨC khỏi UI
        setMessages((prev) => prev.filter((m) => m.id !== messageId));

        try {
            await chatService.deleteMessage(messageId);
            toast.success('Đã xóa tin nhắn');
            // Không cần cập nhật state nữa vì đã xóa rồi
        } catch (error) {
            console.error('Lỗi xóa tin nhắn:', error);
            toast.error('Không thể xóa tin nhắn');
            // Rollback nếu lỗi - khôi phục lại message
            setMessages((prev) => {
                const newMessages = [...prev, deletedMessage];
                // Sắp xếp lại theo thời gian tạo
                return newMessages.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
            });
        } finally {
            // Xóa khỏi danh sách đang xử lý sau 1 giây (đợi WebSocket event)
            setTimeout(() => {
                processingMessagesRef.current.delete(messageId);
            }, 1000);
        }
    };

    const handleTyping = () => {
        chatSocketService.typing(chat.id);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            chatSocketService.stopTyping(chat.id);
        }, 2000);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 5) {
            toast.error('Chỉ được chọn tối đa 5 file');
            return;
        }

        // Kiểm tra kích thước file (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = files.filter(f => f.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast.error(`File "${oversizedFiles[0].name}" quá lớn (tối đa 10MB)`);
            return;
        }

        // Kiểm tra loại file
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed'
        ];

        const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));
        if (invalidFiles.length > 0) {
            toast.error(`Định dạng file "${invalidFiles[0].name}" không được hỗ trợ`);
            return;
        }

        setSelectedFiles(files);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await chatService.searchMessages(chat.id, searchQuery);
            setSearchResults(response.messages || []);
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
            toast.error('Không thể tìm kiếm tin nhắn');
        }
    };

    const startEditMessage = (message) => {
        setEditingMessage(message);
        setNewMessage(message.content);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setNewMessage('');
    };

    const startReply = (message) => {
        setReplyToMessage(message);
    };

    const cancelReply = () => {
        setReplyToMessage(null);
    };

    const getTypingText = () => {
        const typingMembers = members.filter(m => typingUsers.has(m.user.id));
        if (typingMembers.length === 0) return '';
        if (typingMembers.length === 1) return `${typingMembers[0].user.fullName} đang nhập...`;
        return `${typingMembers.length} người đang nhập...`;
    };

    const formatMessageTime = (date) => {
        const messageDate = new Date(date);
        const now = new Date();
        const diffHours = (now - messageDate) / (1000 * 60 * 60);

        if (diffHours < 24) {
            return format(messageDate, 'HH:mm');
        }
        return format(messageDate, 'dd/MM/yyyy HH:mm');
    };

    const renderMessage = (message) => {
        const isOwnMessage = message.senderId === currentUser.id;
        const sender = message.sender;

        return (
            <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} mb-4 w-full min-w-0`}
            >
                <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background shadow-md">
                    <AvatarImage src={sender?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">{sender?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>

                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%] min-w-0`}>
                    {!isOwnMessage && (
                        <span className="text-xs font-medium text-primary/70 mb-1.5 truncate max-w-full">{sender?.fullName}</span>
                    )}

                    {message.replyTo && (
                        <div className="bg-muted/50 p-2.5 rounded-lg text-xs mb-2 border-l-3 border-primary w-full min-w-0 shadow-sm">
                            <div className="font-semibold text-primary truncate flex items-center gap-1">
                                <Reply className="h-3 w-3" />
                                {message.replyTo.sender.fullName}
                            </div>
                            <div className="text-muted-foreground truncate mt-0.5">{message.replyTo.content}</div>
                        </div>
                    )}

                    <div
                        className={`relative group rounded-2xl px-4 py-3 min-w-0 max-w-full shadow-sm transition-all hover:shadow-md ${isOwnMessage
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                            : 'bg-muted/80 backdrop-blur-sm'
                            }`}
                    >
                        {message.content && <p className="break-words whitespace-pre-wrap word-break leading-relaxed">{message.content}</p>}

                        {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2 w-full">
                                {message.attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className="flex items-center gap-2 p-2.5 bg-background/20 backdrop-blur-sm rounded-xl min-w-0 border border-background/40 hover:bg-background/30 transition-colors"
                                    >
                                        {attachment.mimeType.startsWith('image/') ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${attachment.fileUrl}`}
                                                alt={attachment.fileName}
                                                className="max-w-full max-h-96 rounded-xl cursor-pointer object-contain shadow-md hover:shadow-xl transition-shadow"
                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${attachment.fileUrl}`, '_blank')}
                                            />
                                        ) : (
                                            <>
                                                <File className="h-4 w-4 flex-shrink-0" />
                                                <span className="text-sm flex-1 truncate min-w-0">{attachment.fileName}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="flex-shrink-0"
                                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${attachment.fileUrl}`, '_blank')}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isOwnMessage && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-background/30 rounded-full backdrop-blur-sm border border-background/20 shadow-sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 shadow-lg">
                                        {/* Chỉ hiển thị nút chỉnh sửa nếu tin nhắn có nội dung text và không có attachments */}
                                        {message.content && (!message.attachments || message.attachments.length === 0) && (
                                            <DropdownMenuItem
                                                onClick={() => startEditMessage(message)}
                                                className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 py-2.5"
                                            >
                                                <Edit2 className="mr-3 h-4 w-4 text-primary" />
                                                <span className="font-medium">Chỉnh sửa</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive py-2.5"
                                            onClick={() => handleDeleteMessage(message.id)}
                                        >
                                            <Trash2 className="mr-3 h-4 w-4" />
                                            <span className="font-medium">Xóa tin nhắn</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground/70">
                            {formatMessageTime(message.createdAt)}
                        </span>
                        {message.isEdited && (
                            <span className="text-[10px] text-muted-foreground/60 italic">(đã chỉnh sửa)</span>
                        )}
                        {!isOwnMessage && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => startReply(message)}
                            >
                                <Reply className="h-3 w-3 mr-1" />
                                Trả lời
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6">
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <div className="flex-1 ml-64">
                    <DashboardHeader />
                    <main className="p-6">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p>Không tìm thấy chat room cho workspace này</p>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar />
            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 h-[calc(100vh-80px)]">
                    <Card className="h-full flex flex-col shadow-lg border-2">
                        <CardHeader className="border-b from-background to-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{chat.name}</CardTitle>
                                    {chat.unreadCount > 0 && (
                                        <Badge variant="destructive" className="mt-2 shadow-sm">
                                            {chat.unreadCount} tin nhắn mới
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSearch(true)}
                                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all shadow-sm"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Tìm kiếm
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowMembers(true)}
                                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all shadow-sm"
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Thành viên ({members.length})
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
                            <ScrollArea className="flex-1 p-4 overflow-y-auto">
                                <div ref={messagesTopRef} />
                                {hasMoreMessages && (
                                    <div className="text-center py-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={loadMoreMessages}
                                            disabled={isLoadingMore}
                                            className="hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Đang tải...
                                                </>
                                            ) : (
                                                'Tải tin nhắn cũ hơn'
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {messages.map(renderMessage)}
                                {getTypingText() && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic ml-4 animate-pulse">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        {getTypingText()}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </ScrollArea>

                            <Separator className="flex-shrink-0" />

                            <div className="p-4 space-y-2 flex-shrink-0 bg-gradient-to-t from-muted/10 to-background">
                                {replyToMessage && (
                                    <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border-l-4 border-primary shadow-sm">
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold text-primary flex items-center gap-1">
                                                <Reply className="h-3 w-3" />
                                                Trả lời {replyToMessage.sender.fullName}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate mt-1">
                                                {replyToMessage.content}
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={cancelReply} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {editingMessage && (
                                    <div className="flex items-center justify-between bg-accent/10 p-3 rounded-xl border-l-4 border-accent shadow-sm">
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold text-accent flex items-center gap-1">
                                                <Edit2 className="h-3 w-3" />
                                                Chỉnh sửa tin nhắn
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {selectedFiles.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-primary/5 border border-primary/20 p-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <File className="h-4 w-4 text-primary flex-shrink-0" />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="hover:bg-destructive/10 hover:text-destructive rounded-full flex-shrink-0"
                                                    onClick={() =>
                                                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSending || isUploading}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        disabled={isSending || isUploading}
                                        className="focus-visible:ring-primary/50"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSending || isUploading || (!newMessage.trim() && selectedFiles.length === 0)}
                                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
                                    >
                                        {(isSending || isUploading) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showSearch} onOpenChange={setShowSearch}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tìm kiếm tin nhắn</DialogTitle>
                        <DialogDescription>
                            Tìm kiếm tin nhắn và tệp đính kèm trong chat
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nhập từ khóa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="h-96">
                            {searchResults.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Chưa có kết quả tìm kiếm
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {searchResults.map((message) => (
                                        <div
                                            key={message.id}
                                            className="p-3 border rounded hover:bg-muted cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={message.sender?.avatar} />
                                                    <AvatarFallback>
                                                        {message.sender?.fullName?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">
                                                    {message.sender?.fullName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatMessageTime(message.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showMembers} onOpenChange={setShowMembers}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thành viên ({members.length})</DialogTitle>
                        <DialogDescription>
                            Danh sách thành viên trong chat room
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-96">
                        <div className="space-y-2">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center gap-3 p-2">
                                    <Avatar>
                                        <AvatarImage src={member.user?.avatar} />
                                        <AvatarFallback>
                                            {member.user?.fullName?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium">{member.user?.fullName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {member.user?.email}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
