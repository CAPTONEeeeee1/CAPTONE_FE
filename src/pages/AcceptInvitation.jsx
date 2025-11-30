import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";

export default function AcceptInvitationPage() {
    const { invitationId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [invitation, setInvitation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Auto accept invitation when page loads
        handleAcceptInvitation();
    }, [invitationId]);

    const handleAcceptInvitation = async () => {
        try {
            setLoading(true);
            setProcessing(true);

            const response = await workspaceService.acceptInvitation(invitationId);

            setInvitation(response.invitation || response);
            toast.success("Đã chấp nhận lời mời thành công!");

            // Redirect to workspace after 2 seconds
            setTimeout(() => {
                if (response.invitation?.workspaceId || response.workspaceId) {
                    const workspaceId = response.invitation?.workspaceId || response.workspaceId;
                    navigate(`/workspaces/${workspaceId}`);
                } else {
                    navigate("/workspaces");
                }
            }, 2000);

        } catch (error) {
            console.error("Error accepting invitation:", error);
            setError(error.message || "Không thể chấp nhận lời mời");

            if (error.response?.status === 404) {
                toast.error("Lời mời không tồn tại");
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.error || "Lời mời không hợp lệ hoặc đã hết hạn");
            } else if (error.response?.status === 403) {
                toast.error("Bạn không có quyền chấp nhận lời mời này");
            } else {
                toast.error("Không thể chấp nhận lời mời. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center space-y-6">
                        {/* Icon */}
                        <div className={`p-4 rounded-full ${error
                                ? 'bg-red-100'
                                : loading
                                    ? 'bg-blue-100'
                                    : 'bg-green-100'
                            }`}>
                            {error ? (
                                <XCircle className="h-12 w-12 text-red-600" />
                            ) : loading ? (
                                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            ) : (
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold">
                                {error
                                    ? "Có lỗi xảy ra"
                                    : loading
                                        ? "Đang xử lý lời mời..."
                                        : "Chấp nhận thành công!"}
                            </h1>
                            <p className="text-muted-foreground">
                                {error
                                    ? error
                                    : loading
                                        ? "Vui lòng đợi trong giây lát..."
                                        : "Đang chuyển hướng đến workspace..."}
                            </p>
                        </div>

                        {/* Actions */}
                        {error && (
                            <div className="flex flex-col gap-3 w-full">
                                <Button
                                    onClick={handleAcceptInvitation}
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang thử lại...
                                        </>
                                    ) : (
                                        "Thử lại"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/workspaces")}
                                    className="w-full"
                                >
                                    Về trang Workspaces
                                </Button>
                            </div>
                        )}

                        {!error && !loading && (
                            <div className="text-center text-sm text-muted-foreground">
                                <p>Nếu không tự động chuyển hướng,</p>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        if (invitation?.workspaceId) {
                                            navigate(`/workspaces/${invitation.workspaceId}`);
                                        } else {
                                            navigate("/workspaces");
                                        }
                                    }}
                                    className="p-0 h-auto"
                                >
                                    nhấn vào đây
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
