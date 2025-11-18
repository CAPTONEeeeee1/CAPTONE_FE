import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Lock, Palette, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import userService from "@/services/userService";

export default function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePassword = () => {
        const errors = {};

        // Password strength regex
        const hasUpperCase = /[A-Z]/;
        const hasNumber = /[0-9]/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        // Current password validation
        if (!passwordData.currentPassword) {
            errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        } else if (passwordData.currentPassword.length < 12) {
            errors.currentPassword = "Mật khẩu phải có ít nhất 12 ký tự";
        }

        // New password validation
        if (!passwordData.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (passwordData.newPassword.length < 12) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 12 ký tự";
        } else if (!hasUpperCase.test(passwordData.newPassword)) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ hoa";
        } else if (!hasNumber.test(passwordData.newPassword)) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ số";
        } else if (!hasSpecialChar.test(passwordData.newPassword)) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)";
        } else if (passwordData.newPassword === passwordData.currentPassword) {
            errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
        }

        // Confirm password validation
        if (!passwordData.confirmPassword) {
            errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (passwordData.confirmPassword !== passwordData.newPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!validatePassword()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        try {
            setChangingPassword(true);
            await userService.changePassword(passwordData);

            // Reset form on success
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setPasswordErrors({});

            toast.success("Đổi mật khẩu thành công");
        } catch (error) {
            console.error("Error changing password:", error);

            // Handle specific error messages
            if (error.response?.data?.error) {
                const errorMsg = error.response.data.error;
                if (typeof errorMsg === 'string') {
                    if (errorMsg.includes('Current password is incorrect')) {
                        toast.error("Mật khẩu hiện tại không đúng");
                        setPasswordErrors({ currentPassword: "Mật khẩu không đúng" });
                    } else if (errorMsg.includes('must be different')) {
                        toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
                        setPasswordErrors({ newPassword: "Mật khẩu mới phải khác mật khẩu hiện tại" });
                    } else {
                        toast.error(errorMsg);
                    }
                } else {
                    toast.error("Không thể đổi mật khẩu");
                }
            } else {
                toast.error("Không thể đổi mật khẩu");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main content */}
            <div className="flex-1 ml-64">
                <DashboardHeader />

                <main className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                        <p className="text-muted-foreground">Quản lý bảo mật và giao diện của ứng dụng</p>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="security" className="space-y-6">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="security" className="gap-2">
                                <Lock className="h-4 w-4" />
                                Bảo mật
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="gap-2">
                                <Palette className="h-4 w-4" />
                                Giao diện
                            </TabsTrigger>
                        </TabsList>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            <form onSubmit={handleChangePassword}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Đổi mật khẩu</CardTitle>
                                        <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">
                                                Mật khẩu hiện tại <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordInputChange}
                                                    className={passwordErrors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                    disabled={changingPassword}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswords.current ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordErrors.currentPassword && (
                                                <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">
                                                Mật khẩu mới <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordInputChange}
                                                    className={passwordErrors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                                                    placeholder="Nhập mật khẩu mới (tối thiểu 12 ký tự)"
                                                    disabled={changingPassword}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswords.new ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordErrors.newPassword && (
                                                <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                                            )}
                                            <div className="text-sm text-muted-foreground space-y-1">
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
                                            <Label htmlFor="confirmPassword">
                                                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordInputChange}
                                                    className={passwordErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    disabled={changingPassword}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswords.confirm ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordErrors.confirmPassword && (
                                                <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setPasswordData({
                                                        currentPassword: "",
                                                        newPassword: "",
                                                        confirmPassword: ""
                                                    });
                                                    setPasswordErrors({});
                                                }}
                                                disabled={changingPassword}
                                            >
                                                Hủy
                                            </Button>
                                            <Button type="submit" disabled={changingPassword}>
                                                {changingPassword ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang cập nhật...
                                                    </>
                                                ) : (
                                                    "Cập nhật mật khẩu"
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Xác thực hai yếu tố</CardTitle>
                                    <CardDescription>Tăng cường bảo mật cho tài khoản của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Xác thực qua SMS</p>
                                            <p className="text-sm text-muted-foreground">Nhận mã xác thực qua tin nhắn</p>
                                        </div>
                                        <Switch />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Xác thực qua Email</p>
                                            <p className="text-sm text-muted-foreground">Nhận mã xác thực qua email</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Appearance Tab */}
                        <TabsContent value="appearance" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Chế độ hiển thị</CardTitle>
                                    <CardDescription>Tùy chỉnh giao diện theo sở thích của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Chế độ tối (Dark Mode)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Chuyển sang giao diện tối để dễ nhìn hơn
                                            </p>
                                        </div>
                                        <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Màu chủ đề</CardTitle>
                                    <CardDescription>Chọn màu chủ đề cho giao diện</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-5 gap-4">
                                        {[
                                            { name: "Blue", color: "#1A73E8" },
                                            { name: "Purple", color: "#7C3AED" },
                                            { name: "Green", color: "#10B981" },
                                            { name: "Orange", color: "#FF8A00" },
                                            { name: "Pink", color: "#EC4899" },
                                        ].map((theme) => (
                                            <button
                                                key={theme.name}
                                                className="group relative flex flex-col items-center gap-2"
                                            >
                                                <div
                                                    className="h-16 w-16 rounded-2xl shadow-sm ring-2 ring-transparent transition-all group-hover:scale-110 group-hover:ring-offset-2 group-focus:ring-2"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                                <span className="text-sm text-muted-foreground">{theme.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button>Lưu thay đổi</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
