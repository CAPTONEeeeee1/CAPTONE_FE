import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-card">
            <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo + intro */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <span className="text-lg font-bold text-primary-foreground">P</span>
                            </div>
                            <span className="text-xl font-bold">PlanNex</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Nền tảng quản lý công việc và theo dõi tiến độ cho sinh viên và nhóm startup.
                        </p>
                    </div>

                    {/* Product links */}
                    <div>
                        <h3 className="font-semibold mb-4">Sản phẩm</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="#features"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Tính năng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#pricing"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Bảng giá
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Về chúng tôi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support links */}
                    <div>
                        <h3 className="font-semibold mb-4">Hỗ trợ</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Trung tâm trợ giúp
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Tài liệu
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h3 className="font-semibold mb-4">Pháp lý</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2025 PlanNex. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            to="#"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Facebook className="h-5 w-5" />
                        </Link>
                        <Link
                            to="#"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link
                            to="#"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Linkedin className="h-5 w-5" />
                        </Link>
                        <Link
                            to="#"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
