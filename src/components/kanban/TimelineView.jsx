import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, differenceInDays, isBefore, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, AlertCircle, Clock, Flag } from "lucide-react";
import cardService from "@/services/cardService";
import { toast } from "sonner";

export function TimelineView({ board, selectedMember, selectedPriority, selectedLabel }) {
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

    const getDaysRemaining = (dueDate) => {
        if (!dueDate) return null;
        const days = differenceInDays(new Date(dueDate), new Date());
        if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, isOverdue: true };
        if (days === 0) return { text: 'Hết hạn hôm nay', isOverdue: false, isToday: true };
        return { text: `Còn ${days} ngày`, isOverdue: false };
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

    // Filter cards
    const filteredCards = useMemo(() => {
        let cards = [...allCards];

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

        // Only show cards with dates
        cards = cards.filter(card => card.startDate || card.dueDate);

        // Sort by start date or due date
        cards.sort((a, b) => {
            const dateA = new Date(a.startDate || a.dueDate);
            const dateB = new Date(b.startDate || b.dueDate);
            return dateA - dateB;
        });

        return cards;
    }, [allCards, selectedMember, selectedPriority, selectedLabel]);

    // Calculate timeline range
    const timelineRange = useMemo(() => {
        if (filteredCards.length === 0) {
            const today = new Date();
            return {
                start: startOfMonth(today),
                end: endOfMonth(today)
            };
        }

        const dates = [];
        filteredCards.forEach(card => {
            if (card.startDate) dates.push(new Date(card.startDate));
            if (card.dueDate) dates.push(new Date(card.dueDate));
        });

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        return {
            start: startOfMonth(minDate),
            end: endOfMonth(maxDate)
        };
    }, [filteredCards]);

    const totalDays = differenceInDays(timelineRange.end, timelineRange.start) + 1;

    // Generate week markers for timeline header
    const weekMarkers = useMemo(() => {
        const weeks = eachWeekOfInterval(
            { start: timelineRange.start, end: timelineRange.end },
            { weekStartsOn: 1 } // Monday
        );

        return weeks.map(weekStart => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            const startDay = differenceInDays(weekStart, timelineRange.start);
            const duration = Math.min(7, differenceInDays(timelineRange.end, weekStart) + 1);

            return {
                start: weekStart,
                end: weekEnd,
                left: (startDay / totalDays) * 100,
                width: (duration / totalDays) * 100
            };
        });
    }, [timelineRange, totalDays]);

    const getCardPosition = (card) => {
        const cardStart = card.startDate ? new Date(card.startDate) : new Date(card.dueDate);
        const cardEnd = card.dueDate ? new Date(card.dueDate) : new Date(card.startDate);

        const startDay = differenceInDays(cardStart, timelineRange.start);
        const duration = card.startDate && card.dueDate
            ? differenceInDays(cardEnd, cardStart) + 1
            : 1;

        const leftPercent = (startDay / totalDays) * 100;
        const widthPercent = (duration / totalDays) * 100;

        return {
            left: `${Math.max(0, leftPercent)}%`,
            width: `${Math.max(widthPercent, 1.5)}%`,
            duration
        };
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                </CardContent>
            </Card>
        );
    }

    if (filteredCards.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Không có card nào có ngày</h3>
                    <p className="text-muted-foreground text-center">
                        Thêm ngày bắt đầu hoặc ngày hết hạn cho card để xem timeline
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Legend */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-muted-foreground">Ưu tiên thấp</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-muted-foreground">Ưu tiên trung bình</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <span className="text-sm text-muted-foreground">Ưu tiên cao / Quá hạn</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(timelineRange.start, "dd/MM/yyyy")} - {format(timelineRange.end, "dd/MM/yyyy")}</span>
                            <span className="ml-2">({filteredCards.length} card)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lịch trình công việc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Week Headers */}
                    <div className="flex gap-3">
                        <div className="w-64 flex-shrink-0"></div>
                        <div className="flex-1 relative h-8">
                            {weekMarkers.map((week, idx) => (
                                <div
                                    key={idx}
                                    className="absolute border-l border-r border-border/50 h-full flex items-center justify-center"
                                    style={{ left: `${week.left}%`, width: `${week.width}%` }}
                                >
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {format(week.start, "dd MMM", { locale: vi })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cards Timeline */}
                    <div className="space-y-2">
                        {filteredCards.map(card => {
                            const position = getCardPosition(card);
                            const isOverdue = card.dueDate && isBefore(new Date(card.dueDate), new Date());
                            const daysInfo = getDaysRemaining(card.dueDate);

                            return (
                                <div key={card.id} className="group">
                                    <div className="flex items-center gap-3">
                                        {/* Card Info */}
                                        <div className="w-64 flex-shrink-0 p-3 bg-muted/30 rounded-lg border border-border/50 group-hover:border-primary/50 transition-colors">
                                            <div className="flex items-start gap-2">
                                                <div className={`mt-0.5 h-3 w-3 rounded-full flex-shrink-0 ${getPriorityColor(card.priority)}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate" title={card.title}>
                                                        {card.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs py-0 px-1.5">
                                                            {card.listName}
                                                        </Badge>
                                                        {card.members && card.members.length > 0 && (
                                                            <div className="flex -space-x-1.5">
                                                                {card.members.slice(0, 2).map((member, idx) => (
                                                                    <Avatar key={idx} className="h-5 w-5 border-2 border-background">
                                                                        <AvatarImage src={member.user?.avatar} />
                                                                        <AvatarFallback className="text-[10px]">
                                                                            {member.user?.fullName?.charAt(0).toUpperCase() || '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                ))}
                                                                {card.members.length > 2 && (
                                                                    <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                                                                        +{card.members.length - 2}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {daysInfo && (
                                                        <div className={`flex items-center gap-1 mt-1.5 text-xs ${daysInfo.isOverdue ? 'text-red-500' : daysInfo.isToday ? 'text-orange-500' : 'text-muted-foreground'}`}>
                                                            <Clock className="h-3 w-3" />
                                                            <span>{daysInfo.text}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline Bar */}
                                        <div className="flex-1 relative h-12">
                                            {/* Background grid */}
                                            {weekMarkers.map((week, idx) => (
                                                <div
                                                    key={idx}
                                                    className="absolute border-l border-dashed border-border/30 h-full"
                                                    style={{ left: `${week.left}%` }}
                                                ></div>
                                            ))}

                                            {/* Card bar */}
                                            <div
                                                className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-sm flex items-center px-3 text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md cursor-pointer ${isOverdue ? 'bg-red-500' : getPriorityColor(card.priority)
                                                    }`}
                                                style={{ left: position.left, width: position.width }}
                                                title={`${card.title}\n${card.startDate ? format(new Date(card.startDate), "dd/MM/yyyy") : ''} → ${card.dueDate ? format(new Date(card.dueDate), "dd/MM/yyyy") : ''}\nThời gian: ${position.duration} ngày`}
                                            >
                                                <div className="flex items-center gap-2 truncate w-full">
                                                    <Flag className="h-3 w-3 flex-shrink-0" />
                                                    {position.duration > 3 && (
                                                        <span className="truncate">{position.duration} ngày</span>
                                                    )}
                                                    {isOverdue && <AlertCircle className="h-3 w-3 flex-shrink-0 ml-auto" />}
                                                </div>
                                            </div>

                                            {/* Start date marker */}
                                            {card.startDate && (
                                                <div
                                                    className="absolute top-0 -translate-y-full mb-1"
                                                    style={{ left: position.left }}
                                                >
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {format(new Date(card.startDate), "dd/MM")}
                                                    </span>
                                                </div>
                                            )}

                                            {/* End date marker */}
                                            {card.dueDate && (
                                                <div
                                                    className="absolute bottom-0 translate-y-full mt-1"
                                                    style={{ left: position.left, width: position.width }}
                                                >
                                                    <div className="flex justify-end">
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {format(new Date(card.dueDate), "dd/MM")}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
