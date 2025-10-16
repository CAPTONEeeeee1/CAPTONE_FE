import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Lock, Palette } from "lucide-react";

export default function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đổi mật khẩu</CardTitle>
                                    <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                        <Input id="currentPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                        <Input id="newPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                        <Input id="confirmPassword" type="password" />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button>Cập nhật mật khẩu</Button>
                                    </div>
                                </CardContent>
                            </Card>

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
