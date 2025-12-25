import React from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
    // Gộp tất cả thành viên vào 1 mảng để dễ quản lý
    const teamMembers = [
        { name: "Đoàn Văn Quý", role: "Project Leader", avatar: "" },
        { name: "Đặng Thái Phương", role: "Frontend Developer", avatar: "" },
        { name: "Nguyễn Phúc Hưng", role: "Backend Developer", avatar: "" },
        { name: "Lương Quý Quốc", role: "Backend Developer", avatar: "" },
        { name: "Nguyễn Thị Đào", role: "Frontend Developer", avatar: "" },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <main className="flex-1">
                {/* Mission Section */}
                <section className="container py-20 md:py-32 mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">Về PlanNex</h1>
                        <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                            PlanNex được tạo ra với sứ mệnh giúp các nhóm nhỏ, sinh viên và startup làm việc hiệu quả hơn.
                            Chúng tôi tin rằng công cụ quản lý dự án không cần phải phức tạp và đắt đỏ để mang lại giá trị thực sự.
                        </p>
                        <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                            Với giao diện trực quan, tính năng mạnh mẽ và giá cả phải chăng, PlanNex là lựa chọn hoàn hảo
                            cho những ai muốn tập trung vào việc hoàn thành công việc thay vì phải vật lộn với công cụ quản lý.
                        </p>
                    </div>
                </section>

                {/* Team Section - PHẦN ĐÃ SỬA LỖI */}
                <section className="container mx-auto max-w-7xl py-20 px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-balance">Đội ngũ phát triển</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                                Những người đam mê công nghệ và muốn tạo ra giá trị cho cộng đồng
                            </p>
                        </div>

                        {/* - flex-wrap: cho phép tự xuống hàng
                          - justify-center: căn giữa các thẻ trong hàng
                          - gap-6: khoảng cách giữa các card
                        */}
                        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                            {teamMembers.map((member, index) => (
                                <Card 
                                    key={index} 
                                    className="text-center w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] min-w-[280px] bg-card/50 border-border hover:border-primary/50 transition-colors shadow-lg"
                                >
                                    <CardHeader className="py-10">
                                        <div className="flex flex-col items-center gap-6">
                                            <Avatar className="h-24 w-24 border-2 border-border shadow-sm">
                                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                                <AvatarFallback className="text-2xl bg-muted font-semibold">
                                                    {member.name.split(' ').pop()?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2">
                                                <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                                                <CardDescription className="text-sm font-medium uppercase tracking-wider text-primary/80">
                                                    {member.role}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto max-w-7xl py-20 px-4 sm:px-6 lg:px-8">
                    <Card className="bg-primary border-0 text-primary-foreground max-w-4xl mx-auto overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-white/10 rounded-full blur-3xl"></div>
                        
                        <div className="p-12 text-center space-y-6 relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-balance">Trải nghiệm ngay hôm nay</h2>
                            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
                                Bắt đầu quản lý dự án hiệu quả hơn với PlanNex. Miễn phí 14 ngày cho trải nghiệm đầy đủ.
                            </p>
                            <Link to="/auth">
                                <Button size="lg" variant="secondary" className="px-10 h-12 text-base font-semibold">
                                    Bắt đầu miễn phí
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </section>
            </main>

            <Footer />
        </div>
    );
}