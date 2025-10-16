import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Facebook, Linkedin, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "PlanNex có miễn phí không?",
    answer:
      "PlanNex cung cấp gói miễn phí với đầy đủ tính năng cơ bản cho cá nhân và team nhỏ. Chúng tôi cũng có các gói trả phí với nhiều tính năng nâng cao hơn.",
  },
  {
    question: "Làm thế nào để mời thành viên vào workspace?",
    answer:
      "Bạn có thể mời thành viên bằng cách vào workspace, nhấn nút 'Mời thành viên', sau đó nhập email của người bạn muốn mời. Họ sẽ nhận được email mời tham gia.",
  },
  {
    question: "Tôi có thể tạo bao nhiêu board?",
    answer:
      "Với gói miễn phí, bạn có thể tạo không giới hạn board. Tuy nhiên, số lượng thành viên trong mỗi workspace có thể bị giới hạn tùy theo gói sử dụng.",
  },
  {
    question: "PlanNex có hỗ trợ mobile app không?",
    answer:
      "Hiện tại PlanNex là web app responsive, hoạt động tốt trên mọi thiết bị. Chúng tôi đang phát triển mobile app native cho iOS và Android.",
  },
  {
    question: "Dữ liệu của tôi có được bảo mật không?",
    answer:
      "Chúng tôi rất coi trọng bảo mật dữ liệu. Tất cả dữ liệu được mã hóa và lưu trữ an toàn. Chúng tôi tuân thủ các tiêu chuẩn bảo mật quốc tế.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-balance md:text-5xl">Liên hệ & Hỗ trợ</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              {/* Contact Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Gửi phản hồi</CardTitle>
                  <CardDescription>
                    Điền thông tin bên dưới và chúng tôi sẽ phản hồi trong vòng 24 giờ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="nguyenvana@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Tiêu đề</Label>
                    <Input id="subject" placeholder="Tôi cần hỗ trợ về..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Nội dung</Label>
                    <Textarea id="message" rows={6} placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..." />
                  </div>
                  <Button className="w-full" size="lg">
                    Gửi phản hồi
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Thông tin liên hệ</CardTitle>
                    <CardDescription>Các kênh liên hệ trực tiếp với đội ngũ PlanNex</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email hỗ trợ</h3>
                        <p className="mt-1 text-sm text-muted-foreground">support@plannex.com</p>
                        <p className="mt-1 text-xs text-muted-foreground">Phản hồi trong vòng 24 giờ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                        <MessageCircle className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Zalo</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Tìm kiếm: PlanNex Support</p>
                        <p className="mt-1 text-xs text-muted-foreground">Hỗ trợ trực tuyến 9:00 - 18:00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Kết nối với chúng tôi</CardTitle>
                    <CardDescription>Theo dõi PlanNex trên các mạng xã hội</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                        <Facebook className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                        <Linkedin className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-balance">Câu hỏi thường gặp</h2>
                <p className="mt-4 text-muted-foreground">Tìm câu trả lời nhanh cho các câu hỏi phổ biến</p>
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left text-balance">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-pretty">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
