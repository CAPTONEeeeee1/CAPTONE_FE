import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FileText, LayoutDashboard, Clipboard } from 'lucide-react';
import searchService from '@/lib/searchService';
import { useDebounce } from '@/hooks/useDebounce';

const SearchDialog = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { boardId, workspaceId } = useParams();
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                setIsOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const performSearch = useCallback(async () => {
        if (debouncedSearchTerm.length > 1) {
            setLoading(true);
            try {
                const workspacePromise = searchService.searchWorkspaces({ q: debouncedSearchTerm });
                const boardPromise = searchService.searchBoards({ q: debouncedSearchTerm });
                const cardPromise = searchService.searchCards({ q: debouncedSearchTerm });

                const [workspaceResults, boardResults, cardResults] = await Promise.all([workspacePromise, boardPromise, cardPromise]);

                const combinedResults = [
                    ...(workspaceResults || []).map(ws => ({ ...ws, type: 'workspace' })),
                    ...(boardResults || []).map(b => ({ ...b, type: 'board' })),
                    ...(cardResults || []).map(card => ({ ...card, type: 'card' })),
                ];
                
                setResults(combinedResults);
            } catch (error) {
                console.error("Search failed:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    useEffect(() => {
        // Reset state when dialog opens/closes
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
            setLoading(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[450px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Tìm kiếm</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm workspace, bảng, thẻ..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="mt-4 flex-1 overflow-y-auto">
                    {loading && <p className="text-center text-muted-foreground">Đang tìm kiếm...</p>}
                    {!loading && results.length > 0 && (
                        <div className="space-y-2">
                            {results.map((item) => {
                                if (item.type === 'workspace') {
                                    return (
                                        <Link
                                            key={`ws-${item.id}`}
                                            to={`/workspaces/${item.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block p-3 rounded-lg hover:bg-muted"
                                        >
                                            <div className="flex items-center gap-3">
                                                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Không gian làm việc</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }
                                if (item.type === 'board') {
                                    return (
                                        <Link
                                            key={`board-${item.id}`}
                                            to={`/workspaces/${item.workspaceId}/boards/${item.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block p-3 rounded-lg hover:bg-muted"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Clipboard className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Bảng trong không gian làm việc {item.workspace.name}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }
                                if (item.type === 'card') {
                                    return (
                                        <Link
                                            key={`card-${item.id}`}
                                            to={`/workspaces/${item.workspaceId}/boards/${item.boardId}?cardId=${item.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block p-3 rounded-lg hover:bg-muted"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.title}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        Thẻ trong bảng {item.boardName}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                    {!loading && results.length === 0 && searchTerm.length > 1 && (
                        <p className="text-center text-muted-foreground">Không tìm thấy kết quả nào.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchDialog;
