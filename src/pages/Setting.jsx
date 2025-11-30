import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Palette, Bell, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import userService from "@/services/userService";
import settingService from "@/services/settingService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Password change state
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Notification settings state
    const [settings, setSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Fetch notification settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoadingSettings(true);
                const data = await settingService.getSettings();
                setSettings(data);
            } catch (error) {
                toast.error("Không thể tải cài đặt thông báo.");
            } finally {
                setIsLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSettingChange = async (key, value) => {
        const originalSettings = { ...settings };
        
        // Optimistic UI update
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        try {
            await settingService.updateSettings({ [key]: value });
            toast.success("Cài đặt thông báo đã được cập nhật.");
        } catch (error) {
            // Revert on failure
            setSettings(originalSettings);
            toast.error("Lỗi khi cập nhật cài đặt.");
        }
    };


    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePassword = () => {
        const errors = {};
        const hasUpperCase = /[A-Z]/;
        const hasNumber = /[0-9]/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        if (!passwordData.currentPassword) errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        if (!passwordData.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (passwordData.newPassword.length < 12) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 12 ký tự";
        } else if (!hasUpperCase.test(passwordData.newPassword)) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ hoa";
        } else if (!hasNumber.test(passwordData.newPassword)) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ số";
        } else if (!hasSpecialChar.test(passwordData.newPassword)) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt";
        } else if (passwordData.newPassword === passwordData.currentPassword) {
            errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
        }

        if (passwordData.confirmPassword !== passwordData.newPassword) {
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
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordErrors({});
            toast.success("Đổi mật khẩu thành công");
        } catch (error) {
            const errorMsg = error.response?.data?.error;
            if (errorMsg && errorMsg.includes('Current password is incorrect')) {
                toast.error("Mật khẩu hiện tại không đúng");
                setPasswordErrors({ currentPassword: "Mật khẩu không đúng" });
            } else {
                toast.error("Không thể đổi mật khẩu");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const notificationOptions = [
        {
            key: 'workspaceInvitations',
            title: 'Lời mời vào không gian làm việc',
            description: 'Nhận thông báo khi bạn được mời vào một không gian làm việc mới.'
        },
        {
            key: 'workspaceInvitationResponse',
            title: 'Phản hồi lời mời',
            description: 'Nhận thông báo khi ai đó chấp nhận hoặc từ chối lời mời của bạn.'
        },
        {
            key: 'boardCreated',
            title: 'Bảng mới',
            description: 'Nhận thông báo khi một bảng mới được tạo trong không gian làm việc của bạn.'
        },
        {
            key: 'taskAssigned',
            title: 'Giao thẻ (Task)',
            description: 'Nhận thông báo khi bạn được giao một thẻ mới.'
        }
    ];

    const deliveryOptions = [
        {
            key: 'inAppGroupingEnabled',
            title: 'Gộp thông báo trong ứng dụng',
            description: 'Nhóm các thông báo tương tự lại với nhau để giảm sự lộn xộn.'
        },
        {
            key: 'emailDigestEnabled',
            title: 'Bật email tổng hợp',
            description: 'Nhận email tổng hợp các thông báo thay vì nhận riêng lẻ.'
        }
    ];

    const frequencyOptions = [
        { value: 'HOURLY', label: 'Hàng giờ' },
        { value: 'DAILY', label: 'Hàng ngày' },
        { value: 'WEEKLY', label: 'Hàng tuần' },
        { value: 'NEVER', label: 'Không bao giờ' },
    ];

    return (
        <div className="flex min-h-screen">
            <DashboardSidebar />
            <div className="flex-1 ml-64">
                <DashboardHeader />
                <main className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                        <p className="text-muted-foreground">Quản lý tài khoản, thông báo, và giao diện của ứng dụng</p>
                    </div>

                    <Tabs defaultValue="security" className="space-y-6">
                        <TabsList className="grid w-full max-w-lg grid-cols-3">
                            <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" /> Bảo mật</TabsTrigger>
                            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Thông báo</TabsTrigger>
                            <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Giao diện</TabsTrigger>
                        </TabsList>

                        <TabsContent value="security" className="space-y-6">
                           {/* Password Change Form */}
                           <form onSubmit={handleChangePassword}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Đổi mật khẩu</CardTitle>
                                        <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Inputs for password change */}
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Mật khẩu hiện tại <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Input id="currentPassword" name="currentPassword" type={showPasswords.current ? "text" : "password"} value={passwordData.currentPassword} onChange={handlePasswordInputChange} className={passwordErrors.currentPassword ? "border-red-500 pr-10" : "pr-10"} placeholder="Nhập mật khẩu hiện tại" disabled={changingPassword} />
                                                <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                            </div>
                                            {passwordErrors.currentPassword && <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Mật khẩu mới <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Input id="newPassword" name="newPassword" type={showPasswords.new ? "text" : "password"} value={passwordData.newPassword} onChange={handlePasswordInputChange} className={passwordErrors.newPassword ? "border-red-500 pr-10" : "pr-10"} placeholder="Tối thiểu 12 ký tự" disabled={changingPassword} />
                                                <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                            </div>
                                            {passwordErrors.newPassword && <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Input id="confirmPassword" name="confirmPassword" type={showPasswords.confirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={handlePasswordInputChange} className={passwordErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"} placeholder="Nhập lại mật khẩu mới" disabled={changingPassword} />
                                                <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                            </div>
                                            {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>}
                                        </div>
                                        <div className="flex justify-end gap-4">
                                            <Button type="submit" disabled={changingPassword}>{changingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Thông báo chi tiết</CardTitle>
                                    <CardDescription>Chọn những loại thông báo bạn muốn nhận.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {isLoadingSettings ? (
                                        <div className="space-y-6">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-40" />
                                                        <Skeleton className="h-4 w-80" />
                                                    </div>
                                                    <Skeleton className="h-6 w-11 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        notificationOptions.map(option => (
                                            <div key={option.key} className="flex items-center justify-between">
                                                <div>
                                                    <Label htmlFor={option.key} className="text-base font-medium">{option.title}</Label>
                                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                                </div>
                                                <Switch
                                                    id={option.key}
                                                    checked={settings?.[option.key] ?? false}
                                                    onCheckedChange={(value) => handleSettingChange(option.key, value)}
                                                />
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Cách thức nhận thông báo</CardTitle>
                                    <CardDescription>Tùy chỉnh cách bạn nhận thông báo.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                {isLoadingSettings ? (
                                        <div className="space-y-6">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-48" />
                                                        <Skeleton className="h-4 w-72" />
                                                    </div>
                                                    <Skeleton className="h-9 w-24 rounded-md" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            {deliveryOptions.map(option => (
                                                <div key={option.key} className="flex items-center justify-between">
                                                    <div>
                                                        <Label htmlFor={option.key} className="text-base font-medium">{option.title}</Label>
                                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                                    </div>
                                                    <Switch
                                                        id={option.key}
                                                        checked={settings?.[option.key] ?? false}
                                                        onCheckedChange={(value) => handleSettingChange(option.key, value)}
                                                    />
                                                </div>
                                            ))}
                                            {settings?.emailDigestEnabled && (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label htmlFor="emailDigestFrequency" className="text-base font-medium">Tần suất email tổng hợp</Label>
                                                        <p className="text-sm text-muted-foreground">Chọn tần suất bạn muốn nhận email tổng hợp.</p>
                                                    </div>
                                                    <Select
                                                        value={settings?.emailDigestFrequency ?? 'DAILY'}
                                                        onValueChange={(value) => handleSettingChange('emailDigestFrequency', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Chọn tần suất" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {frequencyOptions.map(opt => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-6">
                             {/* Appearance settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Chế độ hiển thị</CardTitle>
                                    <CardDescription>Tùy chỉnh giao diện theo sở thích của bạn.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Chế độ tối (Dark Mode)</p>
                                            <p className="text-sm text-muted-foreground">Chuyển sang giao diện tối để dễ nhìn hơn.</p>
                                        </div>
                                        <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
