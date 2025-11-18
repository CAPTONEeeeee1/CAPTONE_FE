import React from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";

export default function AboutPage() {
    const team = [
        { name: "Nguyễn Văn A", role: "Project Lead", avatar: "" },
        { name: "Trần Thị B", role: "Frontend Developer", avatar: "" },
        { name: "Lê Văn C", role: "Backend Developer", avatar: "" },
    ];

    const comparison = [
        { feature: "Giao diện thân thiện", trello: true, jira: false, plannex: true },
        { feature: "Miễn phí cho sinh viên", trello: false, jira: false, plannex: true },
        { feature: "Kanban board", trello: true, jira: true, plannex: true },
        { feature: "Timeline view", trello: false, jira: true, plannex: true },
        { feature: "Báo cáo chi tiết", trello: false, jira: true, plannex: true },
        { feature: "Dễ sử dụng", trello: true, jira: false, plannex: true },
        { feature: "Tích hợp AI", trello: false, jira: false, plannex: true },
    ];

    return (
        <div className="flex min-h-screen flex-col">
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

                {/* Comparison Section
                <section className="container mx-auto max-w-7xl py-20 bg-muted/30 px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-balance">So sánh với các nền tảng khác</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                                Xem PlanNex khác biệt như thế nào so với Trello và Jira
                            </p>
                        </div>

                        <Card className="max-w-4xl mx-auto">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left p-4 font-semibold">Tính năng</th>
                                                <th className="text-center p-4 font-semibold">Trello</th>
                                                <th className="text-center p-4 font-semibold">Jira</th>
                                                <th className="text-center p-4 font-semibold bg-primary/5">
                                                    <span className="text-primary">PlanNex</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparison.map((item, index) => (
                                                <tr key={index} className="border-b border-border last:border-0">
                                                    <td className="p-4 text-sm">{item.feature}</td>
                                                    <td className="p-4 text-center">
                                                        {item.trello ? (
                                                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-red-600 mx-auto" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {item.jira ? (
                                                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-red-600 mx-auto" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center bg-primary/5">
                                                        {item.plannex ? (
                                                            <Check className="h-5 w-5 text-primary mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-red-600 mx-auto" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section> */}

                {/* Team Section */}
                <section className="container mx-auto max-w-7xl py-20 px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-balance">Đội ngũ phát triển</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                                Những người đam mê công nghệ và muốn tạo ra giá trị cho cộng đồng
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {team.map((member, index) => (
                                <Card key={index} className="text-center">
                                    <CardHeader>
                                        <div className="flex flex-col items-center gap-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xl">{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">{member.name}</CardTitle>
                                                <CardDescription>{member.role}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto max-w-7xl py-20 bg-muted/30 px-4 sm:px-6 lg:px-8">
                    <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground max-w-4xl mx-auto">
                        <CardContent className="p-12 text-center space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-balance">Trải nghiệm ngay hôm nay</h2>
                            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
                                Bắt đầu quản lý dự án hiệu quả hơn với PlanNex. Miễn phí 14 ngày, không cần thẻ tín dụng.
                            </p>
                            <Link to="/auth">
                                <Button size="lg" variant="secondary" className="text-base">
                                    Bắt đầu miễn phí
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </section>
            </main>

            <Footer />
        </div>
    );
}
