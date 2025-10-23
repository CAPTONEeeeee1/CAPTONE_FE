import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import authService from "@/lib/authService"; 
import { toast } from "sonner";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState("register"); // Mặc định mở tab đăng ký
    
    // STATE QUẢN LÝ OTP
    const [isOtpSent, setIsOtpSent] = useState(false); // Trạng thái hiển thị form OTP
    const [otpEmail, setOtpEmail] = useState(''); // Email cần xác minh (lấy từ backend)
    const [otpForm, setOtpForm] = useState(''); // Mã OTP người dùng nhập

    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    // Giả định Base URL của backend được đặt trong biến môi trường VITE_API_BASE_URL
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; 

    // *** XỬ LÝ LỖI TRẢ VỀ TỪ GOOGLE AUTH CALLBACK ***
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');

        // Chỉ xử lý lỗi nếu đang ở tab login hoặc auth
        if (error === 'auth_failed' && location.pathname === '/auth') {
            toast.error('Xác thực Google thất bại. Vui lòng thử lại.');
            // Xóa query param khỏi URL và chuyển về /auth
            navigate('/auth', { replace: true }); 
            setActiveTab("login");
        }
    }, [location, navigate]);

    // Validate email format (Frontend check)
    const isValidEmail = (email) => {
        const basicGmailRegex = /^[a-zA-Z0-9.]+@gmail\.com$/;
        return basicGmailRegex.test(email.trim().toLowerCase());
    };

    // Validate phone number (basic validation)
    const isValidPhone = (phone) => /^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''));

    // Validate registration form
    const validateRegisterForm = () => {
        const newErrors = {};
        
        if (!registerForm.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
        if (!registerForm.email.trim()) newErrors.email = "Vui lòng nhập email";
        else if (!isValidEmail(registerForm.email)) newErrors.email = "Email không hợp lệ. Chỉ chấp nhận định dạng @gmail.com";
        if (!registerForm.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
        else if (!isValidPhone(registerForm.phone)) newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
        if (!registerForm.password) newErrors.password = "Vui lòng nhập mật khẩu";
        else if (registerForm.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        if (registerForm.password !== registerForm.confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate login form
    const validateLoginForm = () => {
        const newErrors = {};
        if (!loginForm.email.trim()) newErrors.email = "Vui lòng nhập email";
        else if (!isValidEmail(loginForm.email)) newErrors.email = "Email không hợp lệ. Chỉ chấp nhận định dạng @gmail.com";
        if (!loginForm.password) newErrors.password = "Vui lòng nhập mật khẩu";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle registration
    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateRegisterForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const result = await authService.register(registerForm);

            // Xử lý response 202 (Verification required)
            if (result.success && result.message === "Verification required") {
                toast.success("Mã xác minh (OTP) đã được gửi. Vui lòng kiểm tra email.");
                setOtpEmail(result.userEmail); // Lấy email từ backend để hiển thị
                setIsOtpSent(true); // HIỂN THỊ FORM OTP
            } else {
                 toast.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
                 setTimeout(() => setActiveTab("login"), 1000);
            }

        } catch (error) {
            console.error("Registration error:", error);
            const status = error.status || error.response?.status;
            const errorMessage = error.response?.data?.error || error.message;

            if (status === 409) {
                toast.error("Email đã được sử dụng. Vui lòng sử dụng email khác.");
                setErrors({ email: "Email đã tồn tại" });
            } else {
                toast.error(errorMessage || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // *** HÀM XỬ LÝ XÁC MINH OTP ***
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        // Validation cơ bản cho OTP (6 chữ số)
        if (otpForm.length !== 6 || !/^[0-9]+$/.test(otpForm)) {
            toast.error("Mã OTP không hợp lệ. Vui lòng nhập 6 chữ số.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await authService.verifyOtp({
                email: otpEmail,
                otp: otpForm
            });
            
            if (result.success) {
                toast.success("Xác minh thành công! Bạn có thể đăng nhập.");
                
                // Reset trạng thái và chuyển sang tab login
                setIsOtpSent(false);
                setOtpForm('');
                setOtpEmail('');
                setActiveTab("login"); 
            }
        } catch (error) {
             console.error("OTP verification error:", error);
             // Sửa lỗi: Đảm bảo hiển thị lỗi từ backend (401) hoặc lỗi chung
             const errorMessage = error.response?.data?.error || "Xác minh thất bại. Mã OTP không đúng hoặc đã hết hạn.";
             toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle login (Giữ nguyên)
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateLoginForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await authService.login(loginForm);
            toast.success("Đăng nhập thành công!");
            setLoginForm({ email: "", password: "" });
            setTimeout(() => { navigate("/dashboard"); }, 1000);
        } catch (error) {
            console.error("Login error:", error);
            const status = error.status || error.response?.status;

            if (status === 401) {
                toast.error("Email hoặc mật khẩu không đúng");
            } else if (status === 403) {
                // Lỗi 403: Tài khoản chưa kích hoạt
                toast.error(error.response?.data?.error || "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
            } else {
                toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Google auth (Giữ nguyên)
    const handleGoogleAuth = () => {
        const googleAuthUrl = `${BACKEND_URL}/auth/google`; 
        window.location.href = googleAuthUrl;
    };

    // Clear error when input changes
    const handleInputChange = (form, field, value) => {
        if (form === 'login') {
            setLoginForm({ ...loginForm, [field]: value });
        } else if (form === 'register') {
            setRegisterForm({ ...registerForm, [field]: value });
        }
        // Xóa lỗi khi input thay đổi
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    // --- RENDER FORM OTP KHI CẦN THIẾT ---
    const renderOtpForm = () => (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Xác minh tài khoản</CardTitle>
                <CardDescription>
                    Mã xác minh (OTP) đã được gửi tới email <span className="font-semibold text-primary">{otpEmail}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Mã xác minh (6 chữ số)</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Nhập OTP"
                            value={otpForm}
                            onChange={(e) => setOtpForm(e.target.value)}
                            maxLength="6"
                            className="text-center text-lg tracking-widest"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Đang xác minh..." : "Xác minh tài khoản"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="link" 
                        onClick={() => setIsOtpSent(false)}
                        className="w-full"
                    >
                        Quay lại Đăng ký
                    </Button>
                </form>
            </CardContent>
        </Card>
    );

    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center bg-background p-4 mt-10 mb-10">
                {isOtpSent ? (
                    renderOtpForm()
                ) : (
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Chào mừng đến với PlanNex</CardTitle>
                            <CardDescription>Đăng nhập hoặc tạo tài khoản để bắt đầu</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                                    <TabsTrigger value="register">Đăng ký</TabsTrigger>
                                </TabsList>

                                {/* --- LOGIN TAB --- */}
                                <TabsContent value="login" className="space-y-4">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-email">Email</Label>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="ten@gmail.com"
                                                value={loginForm.email}
                                                onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                                                className={errors.email ? "border-destructive" : ""}
                                            />
                                            {errors.email && (<p className="text-sm text-destructive">{errors.email}</p>)}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="login-password">Mật khẩu</Label>
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginForm.password}
                                                onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                                                className={errors.password ? "border-destructive" : ""}
                                            />
                                            {errors.password && (<p className="text-sm text-destructive">{errors.password}</p>)}
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                                        </Button>
                                    </form>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full bg-transparent"
                                        onClick={handleGoogleAuth}
                                        disabled={isLoading}
                                    >
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Đăng nhập với Google
                                    </Button>
                                </TabsContent>

                                {/* --- REGISTER TAB --- */}
                                <TabsContent value="register" className="space-y-4">
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="space-y-2"><Label htmlFor="register-fullName">Họ và tên</Label><Input id="register-fullName" type="text" placeholder="Nguyễn Văn A" value={registerForm.fullName} onChange={(e) => handleInputChange('register', 'fullName', e.target.value)} className={errors.fullName ? "border-destructive" : ""} />{errors.fullName && (<p className="text-sm text-destructive">{errors.fullName}</p>)}</div>
                                        <div className="space-y-2"><Label htmlFor="register-email">Email</Label><Input id="register-email" type="email" placeholder="hoanganh@gmail.com" value={registerForm.email} onChange={(e) => handleInputChange('register', 'email', e.target.value)} className={errors.email ? "border-destructive" : ""} />{errors.email && (<p className="text-sm text-destructive">{errors.email}</p>)}</div>
                                        <div className="space-y-2"><Label htmlFor="register-phone">Số điện thoại</Label><Input id="register-phone" type="tel" placeholder="0123456789" value={registerForm.phone} onChange={(e) => handleInputChange('register', 'phone', e.target.value)} className={errors.phone ? "border-destructive" : ""} />{errors.phone && (<p className="text-sm text-destructive">{errors.phone}</p>)}</div>
                                        <div className="space-y-2"><Label htmlFor="register-password">Mật khẩu</Label><Input id="register-password" type="password" placeholder="Abcd1234@" value={registerForm.password} onChange={(e) => handleInputChange('register', 'password', e.target.value)} className={errors.password ? "border-destructive" : ""} />{errors.password && (<p className="text-sm text-destructive">{errors.password}</p>)}</div>
                                        <div className="space-y-2"><Label htmlFor="register-confirm">Xác nhận mật khẩu</Label><Input id="register-confirm" type="password" placeholder="Abcd1234@" value={registerForm.confirmPassword} onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)} className={errors.confirmPassword ? "border-destructive" : ""} />{errors.confirmPassword && (<p className="text-sm text-destructive">{errors.confirmPassword}</p>)}</div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                                        </Button>
                                    </form>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Hoặc đăng ký với</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full bg-transparent"
                                        onClick={handleGoogleAuth}
                                        disabled={isLoading}
                                    >
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">...</svg>
                                        Đăng ký với Google
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        Bằng việc đăng ký, bạn đồng ý với{" "}
                                        <Link to="#" className="text-primary hover:underline">Điều khoản sử dụng</Link>{" "}
                                        và{" "}
                                        <Link to="#" className="text-primary hover:underline">Chính sách bảo mật</Link>
                                    </p>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Footer />
        </div>
    );
}
