import React, { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import userService from "@/services/userService";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        avatar: "",
        description: ""
    });

    const [errors, setErrors] = useState({});

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();
            const userData = response.user;

            setProfile(userData);
            setFormData({
                fullName: userData.fullName || "",
                phone: userData.phone || "",
                avatar: userData.avatar || "",
                description: userData.description || ""
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Không thể tải thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chọn file ảnh");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB");
            return;
        }

        // Read file and convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                avatar: reader.result
            }));
            // Clear error
            if (errors.avatar) {
                setErrors(prev => ({
                    ...prev,
                    avatar: ""
                }));
            }
        };
        reader.onerror = () => {
            toast.error("Không thể đọc file ảnh");
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setFormData(prev => ({
            ...prev,
            avatar: ""
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const validateForm = () => {
        const newErrors = {};

        // Full name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Họ tên không được để trống";
        } else if (formData.fullName.trim().length < 1) {
            newErrors.fullName = "Họ tên phải có ít nhất 1 ký tự";
        }

        // Phone validation (optional but must be valid if provided)
        if (formData.phone && formData.phone.trim()) {
            const phone = formData.phone.trim();
            if (phone.length < 8 || phone.length > 20) {
                newErrors.phone = "Số điện thoại phải từ 8-20 ký tự";
            }
        }

        // Avatar validation (optional but must be valid URL if provided)
        if (formData.avatar && formData.avatar.trim()) {
            try {
                new URL(formData.avatar);
            } catch {
                newErrors.avatar = "Avatar phải là URL hợp lệ";
            }
        }

        // Description validation
        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Mô tả không được vượt quá 500 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        try {
            setUpdating(true);
            const response = await userService.updateProfile(formData);

            setProfile(response.user);
            setFormData({
                fullName: response.user.fullName || "",
                phone: response.user.phone || "",
                avatar: response.user.avatar || "",
                description: response.user.description || ""
            });

            toast.success("Cập nhật thông tin thành công");
        } catch (error) {
            console.error("Error updating profile:", error);

            // Handle specific error messages
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Không thể cập nhật thông tin");
            }
        } finally {
            setUpdating(false);
        }
    };

    // Get user initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar />
                <div className="flex-1 pl-64">
                    <DashboardHeader />
                    <main className="p-8 pt-24">
                        <div className="mx-auto max-w-4xl space-y-8">
                            <div className="flex items-center gap-6">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main content */}
            <div className="flex-1 pl-64">
                <DashboardHeader />

                <main className="p-8 pt-24">
                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Header */}
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border-2">
                                <AvatarImage src={formData.avatar} alt={formData.fullName} />
                                <AvatarFallback className="text-2xl">
                                    {getInitials(formData.fullName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-balance">{formData.fullName}</h1>
                                <p className="mt-1 text-muted-foreground">{profile?.email}</p>
                                {profile?.lastLoginAt && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Đăng nhập lần cuối: {new Date(profile.lastLoginAt).toLocaleString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Personal Info Card */}
                        <form onSubmit={handleSubmit}>
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        <CardTitle>Thông tin cá nhân</CardTitle>
                                    </div>
                                    <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Họ tên <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={errors.fullName ? "border-red-500" : ""}
                                            placeholder="Nhập họ tên đầy đủ"
                                        />
                                        {errors.fullName && (
                                            <p className="text-sm text-red-500">{errors.fullName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile?.email || ""}
                                            disabled
                                            className="bg-muted cursor-not-allowed"
                                        />
                                        <p className="text-sm text-muted-foreground">Email không thể thay đổi</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={errors.phone ? "border-red-500" : ""}
                                            placeholder="Nhập số điện thoại (8-20 ký tự)"
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ảnh đại diện</Label>

                                        {/* Avatar Preview */}
                                        {formData.avatar && (
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-20 w-20 border-2">
                                                    <AvatarImage src={formData.avatar} alt="Preview" />
                                                    <AvatarFallback>
                                                        {getInitials(formData.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRemoveAvatar}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Xóa ảnh
                                                </Button>
                                            </div>
                                        )}

                                        {/* File Input (Hidden) */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        {/* Upload Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleUploadClick}
                                            className="w-full"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Chọn ảnh từ máy
                                        </Button>

                                        {/* URL Input */}
                                        <div className="relative">
                                            <Label htmlFor="avatar" className="text-sm text-muted-foreground">
                                                Hoặc nhập URL ảnh
                                            </Label>
                                            <Input
                                                id="avatar"
                                                name="avatar"
                                                type="url"
                                                value={formData.avatar}
                                                onChange={handleInputChange}
                                                className={errors.avatar ? "border-red-500" : ""}
                                                placeholder="https://example.com/avatar.jpg"
                                            />
                                        </div>

                                        {errors.avatar && (
                                            <p className="text-sm text-red-500">{errors.avatar}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Tải ảnh từ máy (tối đa 5MB) hoặc nhập URL hình ảnh
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Mô tả cá nhân</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className={errors.description ? "border-red-500" : ""}
                                            placeholder="Giới thiệu về bản thân..."
                                            maxLength={500}
                                        />
                                        <div className="flex justify-between items-center">
                                            <div>
                                                {errors.description && (
                                                    <p className="text-sm text-red-500">{errors.description}</p>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formData.description.length}/500
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={fetchProfile}
                                            disabled={updating}
                                        >
                                            Hủy
                                        </Button>
                                        <Button type="submit" disabled={updating}>
                                            {updating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                "Lưu thay đổi"
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
