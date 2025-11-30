import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, User, Tag, ArrowUpDown, AlertCircle } from "lucide-react";
import cardService from "@/services/cardService";
import { toast } from "sonner";

export function ListView({ board, selectedMember, selectedPriority, selectedLabel, onCardClick }) {
    const [sortBy, setSortBy] = useState('title'); // 'title', 'priority', 'dueDate', 'list'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
    const [allCards, setAllCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "low":
                return "bg-green-500";
            case "medium":
                return "bg-yellow-500";
            case "high":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case "low":
                return "Thấp";
            case "medium":
                return "Trung bình";
            case "high":
                return "Cao";
            default:
                return "Chưa xác định";
        }
    };

    // Load all cards from all lists
    const loadAllCards = useCallback(async () => {
        if (!board?.lists || board.lists.length === 0) return;

        setIsLoading(true);
        try {
            const cardsPromises = board.lists.map(list =>
                cardService.getByListId(list.id).catch(err => {
                    console.error(`Error loading cards for list ${list.id}:`, err);
                    return { items: [] };
                })
            );

            const cardsResults = await Promise.all(cardsPromises);

            const cards = [];
            board.lists.forEach((list, index) => {
                const cardsData = cardsResults[index];
                const listCards = cardsData.items || [];

                listCards.forEach(card => {
                    cards.push({
                        id: card.id,
                        title: card.title,
                        description: card.description,
                        priority: card.priority || 'medium',
                        startDate: card.startDate,
                        dueDate: card.dueDate,
                        members: card.members || [],
                        labels: card.labels || [],
                        listName: list.name,
                        listId: list.id
                    });
                });
            });

            setAllCards(cards);
        } catch (error) {
            console.error("Error loading cards:", error);
            toast.error("Không thể tải danh sách cards");
        } finally {
            setIsLoading(false);
        }
    }, [board]);

    useEffect(() => {
        loadAllCards();
    }, [loadAllCards]);

    // Filter and sort cards
    const filteredAndSortedCards = useMemo(() => {
        let cards = [...allCards];

        // Apply filters
        if (selectedMember) {
            cards = cards.filter(card => {
                const members = card.members || [];
                return members.some(member => {
                    const memberUserId = member.userId || member.user?.id || member.id;
                    return memberUserId === selectedMember;
                });
            });
        }

        if (selectedPriority) {
            cards = cards.filter(card => card.priority === selectedPriority);
        }

        if (selectedLabel) {
            cards = cards.filter(card => {
                const labels = card.labels || [];
                return labels.some(label => {
                    const labelId = label.labelId || label.id;
                    return labelId === selectedLabel;
                });
            });
        }

        // Apply sorting
        cards.sort((a, b) => {
            let compareResult = 0;

            switch (sortBy) {
                case 'title':
                    compareResult = a.title.localeCompare(b.title, 'vi');
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    compareResult = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
                    break;
                case 'dueDate':
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    compareResult = dateA - dateB;
                    break;
                case 'list':
                    compareResult = a.listName.localeCompare(b.listName, 'vi');
                    break;
                default:
                    compareResult = 0;
            }

            return sortOrder === 'asc' ? compareResult : -compareResult;
        });

        return cards;
    }, [allCards, selectedMember, selectedPriority, selectedLabel, sortBy, sortOrder]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const SortButton = ({ column, children }) => (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 font-semibold"
            onClick={() => handleSort(column)}
        >
            {children}
            <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
    );

    if (isLoading) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </Card>
        );
    }

    if (filteredAndSortedCards.length === 0) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Không có card nào</h3>
                    <p className="text-muted-foreground text-center">
                        {selectedMember || selectedPriority || selectedLabel
                            ? 'Không tìm thấy card với bộ lọc đã chọn'
                            : 'Board này chưa có card nào'}
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">
                            <SortButton column="title">Tiêu đề</SortButton>
                        </TableHead>
                        <TableHead className="w-[15%]">
                            <SortButton column="list">Danh sách</SortButton>
                        </TableHead>
                        <TableHead className="w-[12%]">
                            <SortButton column="priority">Ưu tiên</SortButton>
                        </TableHead>
                        <TableHead className="w-[15%]">Thành viên</TableHead>
                        <TableHead className="w-[15%]">Nhãn</TableHead>
                        <TableHead className="w-[18%]">
                            <SortButton column="dueDate">Ngày hết hạn</SortButton>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedCards.map(card => {
                        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

                        return (
                            <TableRow
                                key={card.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onCardClick && onCardClick(card)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex flex-col gap-1">
                                        <span>{card.title}</span>
                                        {card.description && (
                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                {card.description}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {card.listName}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${getPriorityColor(card.priority)}`}></div>
                                        <span className="text-sm">{getPriorityLabel(card.priority)}</span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {card.members && card.members.length > 0 ? (
                                        <div className="flex -space-x-2">
                                            {card.members.slice(0, 3).map((member, idx) => (
                                                <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                                                    <AvatarImage src={member.user?.avatar} />
                                                    <AvatarFallback className="text-xs">
                                                        {member.user?.fullName?.charAt(0).toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {card.members.length > 3 && (
                                                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                                    +{card.members.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Chưa gán</span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {card.labels && card.labels.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {card.labels.slice(0, 2).map((label, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-xs"
                                                    style={{
                                                        backgroundColor: label.color + '20',
                                                        color: label.color,
                                                        borderColor: label.color
                                                    }}
                                                >
                                                    {label.name}
                                                </Badge>
                                            ))}
                                            {card.labels.length > 2 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{card.labels.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Không có</span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {card.dueDate ? (
                                        <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-500' : ''}`}>
                                            <Calendar className="h-3 w-3" />
                                            <span className="text-sm">
                                                {format(new Date(card.dueDate), "dd/MM/yyyy")}
                                            </span>
                                            {isOverdue && <AlertCircle className="h-3 w-3" />}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Chưa có</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
