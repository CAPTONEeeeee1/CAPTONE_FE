import React from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Bell, BarChart3, Layout, Zap, Shield } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="container mx-auto py-20 md:py-32 px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                                    Theo dõi tiến độ dễ dàng – Cộng tác hiệu quả cùng{" "}
                                    <span className="text-primary">PlanNex</span>
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                                    Nền tảng quản lý công việc hiện đại dành cho sinh viên, nhóm startup nhỏ và cá nhân.
                                    Tổ chức công việc thông minh, theo dõi tiến độ trực quan.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/auth">
                                    <Button size="lg" className="text-base">
                                        Bắt đầu ngay
                                    </Button>
                                </Link>
                                <Link to="#demo">
                                    <Button size="lg" variant="outline" className="text-base bg-transparent">
                                        Xem demo
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-sm text-muted-foreground">Miễn phí 14 ngày</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-sm text-muted-foreground">Không cần thẻ tín dụng</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
                                <img
                                    src="/kanban-board-with-todo-in-progress-done-columns.jpg"
                                    alt="PlanNex Dashboard Preview"
                                    width={600}
                                    height={500}
                                    className="rounded-lg w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="hidden w-full h-80 bg-muted rounded-lg items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <Layout className="h-12 w-12 text-muted-foreground mx-auto" />
                                        <p className="text-muted-foreground">PlanNex Dashboard Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="container mx-auto max-w-7xl py-20 bg-muted/30 px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-balance">Tính năng nổi bật</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                            Mọi công cụ bạn cần để quản lý dự án hiệu quả và cộng tác liền mạch
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon={<Layout className="h-6 w-6 text-primary" />} title="Giao diện trực quan">
                            Bảng Kanban hiện đại với drag & drop, dễ sử dụng cho mọi người
                        </FeatureCard>
                        <FeatureCard icon={<Bell className="h-6 w-6 text-accent" />} title="Thông báo đa kênh">
                            Nhận thông báo qua email, web và mobile để không bỏ lỡ cập nhật quan trọng
                        </FeatureCard>
                        <FeatureCard icon={<BarChart3 className="h-6 w-6 text-primary" />} title="Báo cáo chi tiết">
                            Theo dõi tiến độ với biểu đồ trực quan và thống kê hiệu suất nhóm
                        </FeatureCard>
                        <FeatureCard icon={<Users className="h-6 w-6 text-accent" />} title="Cộng tác nhóm">
                            Mời thành viên, phân quyền và làm việc cùng nhau trong thời gian thực
                        </FeatureCard>
                        <FeatureCard icon={<Zap className="h-6 w-6 text-primary" />} title="Tự động hóa">
                            Tự động gán task, nhắc nhở deadline và cập nhật trạng thái công việc
                        </FeatureCard>
                        <FeatureCard icon={<Shield className="h-6 w-6 text-accent" />} title="Bảo mật cao">
                            Mã hóa dữ liệu, kiểm soát quyền truy cập và sao lưu tự động
                        </FeatureCard>
                    </div>
                </section>

                {/* Demo Preview Section */}
                <section id="demo" className="container mx-auto max-w-7xl py-20 px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-balance">Trải nghiệm giao diện</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                            Khám phá các tính năng mạnh mẽ của PlanNex
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <DemoCard
                            title="Bảng Kanban"
                            desc="Quản lý công việc trực quan với drag & drop"
                            img="/modern-kanban-board-interface-with-colorful-task-c.jpg"
                        />
                        <DemoCard
                            title="Dashboard"
                            desc="Theo dõi tiến độ và thống kê hiệu suất"
                            img="/project-dashboard-with-charts-and-statistics.jpg"
                        />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto max-w-7xl py-20 px-4 sm:px-6 lg:px-8">
                    <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground">
                        <CardContent className="p-12 text-center space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-balance">
                                Sẵn sàng nâng cao hiệu suất làm việc?
                            </h2>
                            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
                                Tham gia cùng hàng nghìn sinh viên và nhóm startup đang sử dụng PlanNex
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link to="/auth">
                                    <Button size="lg" variant="secondary" className="text-base">
                                        Bắt đầu miễn phí
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                                    >
                                        Tìm hiểu thêm
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>

            <Footer />
        </div>
    );
}

/* ---------- Sub Components ---------- */
function FeatureCard({ icon, title, children }) {
    return (
        <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{children}</CardDescription>
            </CardHeader>
        </Card>
    );
}

function DemoCard({ title, desc, img }) {
    const [imageError, setImageError] = React.useState(false);

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
                {!imageError ? (
                    <img
                        src={img}
                        alt={title}
                        width={600}
                        height={400}
                        className="rounded-lg border border-border w-full h-auto"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-64 bg-muted rounded-lg border border-border flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <Layout className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">{title} Preview</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
