import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from '@/lib/api';

export default function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, email } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    useEffect(() => {
        if (!userId || !email) {
            toast.error('Phiên xác thực không hợp lệ');
            navigate('/auth');
        }
        // Focus first input
        inputRefs[0].current?.focus();
    }, [userId, email, navigate]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto-submit when all filled
        if (index === 5 && value && newOtp.every(digit => digit !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (!/^\d{6}$/.test(pastedData)) {
            toast.error('Vui lòng paste mã OTP 6 chữ số hợp lệ');
            return;
        }

        const newOtp = pastedData.split('');
        setOtp(newOtp);
        inputRefs[5].current?.focus();

        // Auto-submit
        handleVerify(pastedData);
    };

    const handleVerify = async (otpString) => {
        const otpCode = otpString || otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Vui lòng nhập đầy đủ 6 chữ số');
            return;
        }

        setIsVerifying(true);

        try {
            // SỬA LỖI: Loại bỏ tiền tố /api để khớp với cấu hình backend
            const response = await api.post('/auth/verify-otp', {
                email: email, // Gửi email thay vì userId để nhất quán với backend
                otp: otpCode,
            });

            toast.success('Xác thực thành công! Đang chuyển đến trang đăng nhập...', {
                duration: 3000
            });

            setTimeout(() => {
                navigate('/auth', { state: { verified: true } });
            }, 2000);

        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.data?.error || 'Mã OTP không đúng. Vui lòng thử lại.');

            // Clear OTP and focus first input
            setOtp(['', '', '', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            // SỬA LỖI: Loại bỏ tiền tố /api
            await api.post('/auth/resend-verification', { email });
            toast.success('Mã OTP mới đã được gửi đến email của bạn!', {
                duration: 4000
            });
        } catch (error) {
            console.error('Resend error:', error);
            toast.error('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-blue-100 p-4">
                            <Mail className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Xác thực Email</CardTitle>
                    <CardDescription>
                        Nhập mã OTP 6 chữ số đã được gửi đến<br />
                        <span className="font-semibold text-foreground">{email}</span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* OTP Input Fields */}
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-12 h-14 text-center text-2xl font-bold"
                                disabled={isVerifying}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={() => handleVerify()}
                        className="w-full"
                        disabled={isVerifying || otp.some(digit => !digit)}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xác thực...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Xác thực
                            </>
                        )}
                    </Button>

                    {/* Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-center text-blue-800 dark:text-blue-200">
                            Mã OTP có hiệu lực trong <strong>10 phút</strong>
                        </p>
                        <p className="text-sm text-center text-blue-800 dark:text-blue-200">
                            Bạn có <strong>5 lần thử</strong> để nhập đúng mã
                        </p>
                    </div>

                    {/* Resend */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Không nhận được mã?
                        </p>
                        <Button
                            variant="link"
                            onClick={handleResend}
                            disabled={isResending}
                            className="p-0 h-auto"
                        >
                            {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                        </Button>
                    </div>

                    {/* Back to Login */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/auth')}
                            className="text-sm"
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
