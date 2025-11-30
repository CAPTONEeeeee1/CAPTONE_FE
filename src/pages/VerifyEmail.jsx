import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import api from '@/lib/api';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        verifyEmailToken();
    }, [token]);

    const verifyEmailToken = async () => {
        try {
            const response = await api.get(`/auth/verify-email/${token}`);
            setStatus('success');
            setMessage(response.data.message || 'Email verified successfully!');
            setUserEmail(response.data.user?.email || '');

            // Auto redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/auth?tab=login');
            }, 3000);
        } catch (error) {
            setStatus('error');
            setMessage(
                error.response?.data?.error ||
                'Failed to verify email. The link may be invalid or expired.'
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2 pb-6">
                    {status === 'verifying' && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <Mail className="h-16 w-16 text-blue-600 animate-pulse" />
                                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin absolute -bottom-1 -right-1" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Đang xác thực email...</CardTitle>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-green-600">
                                Xác thực thành công! 🎉
                            </CardTitle>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-red-100 p-3">
                                    <XCircle className="h-16 w-16 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-red-600">
                                Xác thực thất bại
                            </CardTitle>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        {message}
                    </p>

                    {status === 'success' && userEmail && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-center">
                                <strong>Email:</strong> {userEmail}
                            </p>
                            <p className="text-sm text-center text-green-700">
                                Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-center text-yellow-800">
                                Link xác thực có thể đã hết hạn (24 giờ)
                            </p>
                            <p className="text-sm text-center text-yellow-800">
                                Vui lòng đăng nhập và yêu cầu gửi lại email xác thực
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={() => navigate('/auth?tab=login')}
                            className="w-full"
                            variant={status === 'success' ? 'default' : 'outline'}
                        >
                            {status === 'success' ? 'Đăng nhập ngay' : 'Về trang đăng nhập'}
                        </Button>

                        {status === 'error' && (
                            <Link to="/auth?tab=register">
                                <Button variant="ghost" className="w-full">
                                    Đăng ký tài khoản mới
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
