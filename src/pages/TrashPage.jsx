import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    getTrashedBoards,
    restoreBoard,
    permanentlyDeleteBoard,
    getTrashedCardsInWorkspace,
    getTrashedCards,
    restoreCard,
    permanentlyDeleteCard
} from '../services/trashService';
import {
    Trash2,
    RotateCcw,
    AlertCircle,
    Clock,
    ArrowLeft,
    X,
    MessageCircle
} from 'lucide-react';

function TrashPage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('boards'); // 'boards' | 'cards'
    const [trashedBoards, setTrashedBoards] = useState([]);
    const [trashedCards, setTrashedCards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTrashedBoards();
        loadTrashedCardsInWorkspace();
    }, [workspaceId]);

    // Auto switch to cards tab if no boards but have cards
    useEffect(() => {
        if (!loading && trashedBoards.length === 0 && trashedCards.length > 0 && activeTab === 'boards') {
            setActiveTab('cards');
        }
    }, [loading, trashedBoards.length, trashedCards.length, activeTab]);

    const loadTrashedBoards = async () => {
        try {
            setLoading(true);
            const data = await getTrashedBoards(workspaceId);
            console.log('Loaded boards:', data);
            setTrashedBoards(data.boards || []);
        } catch (error) {
            console.error('Error loading trashed boards:', error);
            if (error.status === 403) {
                toast.error('Chỉ admin và owner mới có quyền xem thùng rác');
                navigate(`/workspaces/${workspaceId}`);
            } else {
                toast.error('Không thể tải boards đã xóa');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadTrashedCardsInWorkspace = async () => {
        try {
            const data = await getTrashedCardsInWorkspace(workspaceId);
            console.log('Loaded cards:', data);
            setTrashedCards(data.cards || []);
        } catch (error) {
            console.error('Error loading trashed cards:', error);
            toast.error('Không thể tải cards đã xóa');
        }
    };

    const loadTrashedCardsForBoard = async (boardId) => {
        setLoading(true);
        try {
            const data = await getTrashedCards(boardId);
            setTrashedCards(data.cards || []);
            setSelectedBoard(boardId);
            setActiveTab('cards');
        } catch (error) {
            console.error('Error loading trashed cards:', error);
            toast.error('Không thể tải cards đã xóa');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreBoard = async (boardId) => {
        try {
            const result = await restoreBoard(boardId);
            toast.success(`Đã khôi phục board "${result.board?.name || ''}" thành công`);

            // Reload trash list to remove restored board
            await loadTrashedBoards();

            // Optional: Navigate back to workspace after short delay
            setTimeout(() => {
                toast.info('Board đã được khôi phục về workspace');
            }, 1500);
        } catch (error) {
            console.error('Error restoring board:', error);
            const errorMsg = error.message || error.data?.error || 'Không thể khôi phục board';
            toast.error(errorMsg);
        }
    };

    const handlePermanentDeleteBoard = async (boardId, boardName) => {
        if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn board "${boardName}"?\n\nHành động này không thể hoàn tác và sẽ xóa toàn bộ lists, cards, comments, attachments trong board.`)) {
            return;
        }

        try {
            await permanentlyDeleteBoard(boardId);
            toast.success(`Đã xóa vĩnh viễn board "${boardName}"`);
            await loadTrashedBoards();
        } catch (error) {
            console.error('Error permanently deleting board:', error);
            const errorMsg = error.message || error.data?.error || 'Không thể xóa board';
            toast.error(errorMsg);
        }
    };

    const handleRestoreCard = async (cardId) => {
        try {
            const result = await restoreCard(cardId);
            toast.success(`Đã khôi phục card "${result.card?.title || ''}" thành công`);

            // Reload trashed cards list
            if (selectedBoard) {
                await loadTrashedCardsForBoard(selectedBoard);
            } else {
                await loadTrashedCardsInWorkspace();
            }

            toast.info('Card đã được khôi phục về board');
        } catch (error) {
            console.error('Error restoring card:', error);
            const errorMsg = error.message || error.data?.error || 'Không thể khôi phục card';
            toast.error(errorMsg);
        }
    };
    const handlePermanentDeleteCard = async (cardId, cardTitle) => {
        if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn card "${cardTitle}"?\n\nHành động này không thể hoàn tác và sẽ xóa toàn bộ comments, attachments, labels.`)) {
            return;
        }

        try {
            await permanentlyDeleteCard(cardId);
            toast.success(`Đã xóa vĩnh viễn card "${cardTitle}"`);
            if (selectedBoard) {
                await loadTrashedCardsForBoard(selectedBoard);
            } else {
                await loadTrashedCardsInWorkspace();
            }
        } catch (error) {
            console.error('Error permanently deleting card:', error);
            const errorMsg = error.message || error.data?.error || 'Không thể xóa card';
            toast.error(errorMsg);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const remainingDays = 15 - diffDays;

        return {
            formatted: date.toLocaleDateString('vi-VN'),
            remainingDays,
            isExpiringSoon: remainingDays <= 3
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}`)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                                title="Quay lại workspace"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Thùng rác</h1>
                                    <p className="text-sm text-gray-500">Quản lý các items đã xóa</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-all hover:scale-105 shadow-sm"
                                title="Mở chat workspace"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Chat</span>
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-800">Tự động xóa sau 15 ngày</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow-sm w-fit">
                    <button
                        onClick={() => {
                            setActiveTab('boards');
                            setSelectedBoard(null);
                        }}
                        className={`px-6 py-2.5 font-medium rounded-md transition-all ${activeTab === 'boards'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            Boards
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'boards' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                {trashedBoards.length}
                            </span>
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('cards');
                            setSelectedBoard(null);
                            loadTrashedCardsInWorkspace();
                        }}
                        className={`px-6 py-2.5 font-medium rounded-md transition-all ${activeTab === 'cards'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            Cards
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'cards' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                {trashedCards.length}
                            </span>
                        </span>
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 font-medium">Đang tải...</p>
                    </div>
                )}
                {/* Boards Tab */}
                {activeTab === 'boards' && !loading && (
                    <div className="space-y-4">
                        {trashedBoards.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
                                <div className="p-4 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                    <Trash2 className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có board nào trong thùng rác</h3>
                                <p className="text-sm text-gray-500">Các board đã xóa sẽ xuất hiện tại đây</p>
                            </div>
                        ) : (
                            trashedBoards.map((board) => {
                                const dateInfo = formatDate(board.archivedAt);
                                return (
                                    <div
                                        key={board.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {board.name}
                                                    </h3>
                                                    {dateInfo.isExpiringSoon && (
                                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1.5 animate-pulse">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            Còn {dateInfo.remainingDays} ngày
                                                        </span>
                                                    )}
                                                </div>
                                                {board.description && (
                                                    <p className="text-gray-600 mb-4 line-clamp-2">{board.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                                        {dateInfo.formatted}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                                                        {board._count?.lists || 0} lists
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                                                        {board._count?.cards || 0} cards
                                                    </span>
                                                    {board.createdBy && (
                                                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                                                            {board.createdBy.fullName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-6">
                                                <button
                                                    onClick={() => loadTrashedCardsForBoard(board.id)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                                                >
                                                    Xem cards
                                                </button>
                                                <button
                                                    onClick={() => handleRestoreBoard(board.id)}
                                                    className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 justify-center shadow-sm hover:shadow-md"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    Khôi phục
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDeleteBoard(board.id, board.name)}
                                                    className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 justify-center shadow-sm hover:shadow-md"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Xóa vĩnh viễn
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
                {/* Cards Tab */}
                {activeTab === 'cards' && !loading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6 bg-white px-6 py-4 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedBoard ? ' Cards đã xóa trong board này' : ' Tất cả cards đã xóa trong workspace'}
                            </h2>
                            {selectedBoard && (
                                <button
                                    onClick={() => {
                                        setSelectedBoard(null);
                                        loadTrashedCardsInWorkspace();
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Xem tất cả cards →
                                </button>
                            )}
                        </div>

                        {trashedCards.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
                                <div className="p-4 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                    <Trash2 className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có card nào trong thùng rác</h3>
                                <p className="text-sm text-gray-500">Các card đã xóa sẽ xuất hiện tại đây</p>
                            </div>
                        ) : (
                            trashedCards.map((card) => {
                                const dateInfo = formatDate(card.archivedAt);
                                return (
                                    <div
                                        key={card.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {card.title}
                                                    </h3>
                                                    {card.priority && (
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${card.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                            card.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                card.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {card.priority.toUpperCase()}
                                                        </span>
                                                    )}
                                                    {dateInfo.isExpiringSoon && (
                                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1.5 animate-pulse">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            Còn {dateInfo.remainingDays} ngày
                                                        </span>
                                                    )}
                                                </div>
                                                {card.description && (
                                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                                        {card.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 text-sm flex-wrap">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                                        {dateInfo.formatted}
                                                    </span>
                                                    {card.board && (
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                                                            {card.board.name}
                                                        </span>
                                                    )}
                                                    {card.list && (
                                                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                                                            {card.list.name}
                                                        </span>
                                                    )}
                                                    {card.createdBy && (
                                                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                                                            {card.createdBy.fullName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-6">
                                                <button
                                                    onClick={() => handleRestoreCard(card.id)}
                                                    className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 justify-center shadow-sm hover:shadow-md"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    Khôi phục
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDeleteCard(card.id, card.title)}
                                                    className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 justify-center shadow-sm hover:shadow-md"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Xóa vĩnh viễn
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrashPage;
