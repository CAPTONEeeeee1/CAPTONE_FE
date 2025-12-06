import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import chatService from '@/services/chatService';

const ChatWidget = ({ workspaceId }) => {
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isChatView, setIsChatView] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!workspaceId) return;

        const token = localStorage.getItem('token');
        const socketUrl = import.meta.env.VITE_API_URL;
        const newSocket = io(socketUrl, {
            auth: {
                token: token
            }
        });

        setSocket(newSocket);

        newSocket.on('connect_error', (err) => {
            console.error("Socket connection error:", err.message);
            toast.error(`Socket connection failed: ${err.message}`);
        });

        newSocket.emit('joinWorkspace', workspaceId);

        newSocket.on('newMessage', (message) => {
            if (selectedConversation && message.conversationId === selectedConversation.id) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
            fetchConversations(); // Refresh conversations to show latest message hint
        });

        return () => {
            newSocket.emit('leaveWorkspace', workspaceId);
            newSocket.close();
        };
    }, [workspaceId]);

    useEffect(() => {
        if (workspaceId) {
            fetchConversations();
        }
    }, [workspaceId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await chatService.getConversations(workspaceId);
            setConversations(response.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error('Failed to load conversations.');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        try {
            const response = await chatService.getMessages(conversation.id);
            setMessages(response.messages);
            setIsChatView(true);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages.');
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedConversation && socket) {
            socket.emit('sendMessage', {
                workspaceId,
                conversationId: selectedConversation.id,
                senderId: currentUser.id,
                content: newMessage.trim(),
            });
            setNewMessage('');
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchConversations();
        } else {
            setIsChatView(false);
            setSelectedConversation(null);
        }
    };

    const backToConversations = () => {
        setIsChatView(false);
        setSelectedConversation(null);
        setMessages([]);
    };

    if (!workspaceId) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!isOpen ? (
                <Button onClick={toggleChat} className="rounded-full w-16 h-16">
                    <MessageSquare size={32} />
                </Button>
            ) : (
                <Card className="w-96 h-[500px] flex flex-col shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                        {isChatView && selectedConversation ? (
                             <>
                                <Button variant="ghost" size="icon" onClick={backToConversations} className="mr-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                </Button>
                                <CardTitle className="text-lg flex-1 truncate">
                                     {selectedConversation.participants.filter(p => p.userId !== currentUser.id).map(p => p.user.fullName).join(', ')}
                                 </CardTitle>
                             </>
                        ) : (
                            <CardTitle className="text-lg">Conversations</CardTitle>
                        )}
                        <Button variant="ghost" size="icon" onClick={toggleChat}>
                            <X size={20} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col">
                        {isChatView && selectedConversation ? (
                            <>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex items-end gap-2 my-2 ${msg.senderId === currentUser.id ? 'justify-end' : ''}`}>
                                            {msg.senderId !== currentUser.id && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={msg.sender.avatar} alt={msg.sender.fullName} />
                                                    <AvatarFallback>{msg.sender.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t flex gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="overflow-y-auto">
                                {conversations.length > 0 ? (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className="p-4 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                                            onClick={() => handleSelectConversation(conv)}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={conv.participants.find(p => p.userId !== currentUser.id)?.user.avatar} />
                                                <AvatarFallback>{conv.participants.find(p => p.userId !== currentUser.id)?.user.fullName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold truncate">
                                                    {conv.participants.filter(p => p.userId !== currentUser.id).map(p => p.user.fullName).join(', ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conv.messages[0]?.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No conversations yet. Start a chat from a board or user profile!
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ChatWidget;