import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("login");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      toast.error(message || "Đăng nhập thất bại", {
        description: error === 'account_suspended' 
          ? "Tài khoản của bạn đã bị khóa. Vui lòng kiểm tra email hoặc liên hệ quản trị viên." 
          : "Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        duration: 5000,
      });
      // Clean the URL
      searchParams.delete('error');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""));

  const validateRegisterForm = () => {
    const newErrors = {};
    const hasUpperCase = /[A-Z]/;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!registerForm.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    else if (!registerForm.fullName.includes(" ")) newErrors.fullName = "Vui lòng nhập có ít nhất một khoảng trắng";
    else if (hasNumber.test(registerForm.fullName)) newErrors.fullName = "Họ và tên không được chứa số";

    if (!registerForm.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!isValidEmail(registerForm.email)) newErrors.email = "Email không hợp lệ";

    if (!registerForm.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(registerForm.phone)) newErrors.phone = "Số điện thoại phải có 10-11 chữ số";

    if (!registerForm.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (registerForm.password.length < 12) newErrors.password = "Mật khẩu phải có ít nhất 12 ký tự";
    else if (!hasUpperCase.test(registerForm.password)) newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa";
    else if (!hasNumber.test(registerForm.password)) newErrors.password = "Mật khẩu phải có ít nhất 1 chữ số";
    else if (!hasSpecialChar.test(registerForm.password))
      newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)";

    if (!registerForm.confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (registerForm.password !== registerForm.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginForm.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!isValidEmail(loginForm.email)) newErrors.email = "Email không hợp lệ";
    if (!loginForm.password) newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await authService.register(registerForm);
      toast.success("Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.", { duration: 4000 });
      setTimeout(() => {
        navigate("/verify-otp", {
          state: { userId: response.user.id, email: registerForm.email },
        });
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.status === 409) {
        const errorMsg = error.data?.error || error.message;
        toast.error(errorMsg);
        if (errorMsg.includes("Email")) setErrors({ email: "Email đã tồn tại" });
        else if (errorMsg.includes("Phone")) setErrors({ phone: "Số điện thoại đã được sử dụng" });
      } else toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setIsLoading(true);
    setErrors({});
    setShowResendVerification(false);

    try {
      const response = await authService.login(loginForm);
      const data = response?.data || response;
      const token = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken || response?.refreshToken;
      const user = data?.user || data?.data?.user;

      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      toast.success("Đăng nhập thành công!");

      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

      setLoginForm({ email: "", password: "" });
    } catch (error) {
      console.error("Login error:", error);
      if (error.status === 403 && error.data?.code === 'ACCOUNT_SUSPENDED') {
        toast.error("Tài khoản của bạn đã bị khóa.", {
          description: "Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.",
        });
      }
      else if (error.status === 403 && error.data?.error?.includes("kích hoạt")) {
        setUnverifiedEmail(loginForm.email);
        setShowResendVerification(true);
        toast.error("Tài khoản chưa được kích hoạt.", {
          description: "Bạn có muốn chúng tôi gửi lại mã OTP không?",
          action: {
            label: "Đi đến trang xác thực",
            onClick: () => navigate("/verify-otp", { state: { email: loginForm.email } }),
          },
        });
      } else if (error.status === 401) {
        if (error.data?.error?.includes("Google")) toast.error("Lỗi đăng nhập", { description: error.data.error });
        else toast.error("Email hoặc mật khẩu không đúng");
      } else toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      toast.success("Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.", { duration: 5000 });
      setShowResendVerification(false);
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error(error.message || "Không thể gửi lại email. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const googleAuthUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  const handleInputChange = (form, field, value) => {
    if (form === "login") setLoginForm({ ...loginForm, [field]: value });
    else setRegisterForm({ ...registerForm, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center bg-background p-4 mt-10 mb-10">
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
                      placeholder="ten@example.com"
                      value={loginForm.email}
                      onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
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
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end -mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  {showResendVerification && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang gửi..." : "Gửi lại email xác thực"}
                      </Button>
                    </div>
                  )}
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
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
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Đăng nhập với Google
                </Button>
              </TabsContent>

              {/* --- REGISTER TAB --- */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullName">Họ và tên</Label>
                    <Input
                      id="register-fullName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={registerForm.fullName}
                      onChange={(e) => handleInputChange('register', 'fullName', e.target.value)}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="example@gmail.com"
                      value={registerForm.email}
                      onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Số điện thoại</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="0123456789"
                      value={registerForm.phone}
                      onChange={(e) => handleInputChange('register', 'phone', e.target.value)}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Ví dụ: MyP@ssw0rd123"
                      value={registerForm.password}
                      onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">Yêu cầu mật khẩu:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Tối thiểu 12 ký tự</li>
                        <li>Có ít nhất 1 chữ hoa (A-Z)</li>
                        <li>Có ít nhất 1 chữ số (0-9)</li>
                        <li>Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Xác nhận mật khẩu</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={registerForm.confirmPassword}
                      onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
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
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Đăng ký với Google
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <Link to="#" className="text-primary hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link to="#" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
