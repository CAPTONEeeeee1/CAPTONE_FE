import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";

export default function ProfilePage() {

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
                            <div className="relative">
                                <img
                                    src="/avatar.jpg"
                                    alt="Ảnh đại diện"
                                    className="h-24 w-24 rounded-full object-cover border border-gray-200"
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-balance">Nguyễn Văn A</h1>
                                <p className="mt-1 text-muted-foreground">nguyenvana@example.com</p>
                                <Button
                                    variant="outline"
                                    className="mt-3 gap-2 bg-transparent text-black hover:bg-gray-100"
                                    size="sm"
                                >
                                    <Upload className="h-4 w-4" />
                                    Thay đổi ảnh đại diện
                                </Button>
                            </div>
                        </div>


                        {/* Personal Info Card */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <CardTitle>Thông tin cá nhân</CardTitle>
                                </div>
                                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Họ</Label>
                                        <Input id="firstName" defaultValue="Nguyễn Văn" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Tên</Label>
                                        <Input id="lastName" defaultValue="A" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue="nguyenvana@example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" type="tel" defaultValue="+84 123 456 789" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Mô tả cá nhân</Label>
                                    <Textarea
                                        id="bio"
                                        rows={4}
                                        defaultValue="Tôi là một developer đam mê công nghệ và luôn học hỏi những điều mới."
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button>Lưu thay đổi</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
