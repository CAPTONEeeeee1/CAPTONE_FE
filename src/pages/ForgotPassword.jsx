import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer'; 
import authService from '@/lib/authService';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !isValidEmail(email)) {
      setError('Vui lòng nhập một địa chỉ email hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendPasswordResetCode(email);
      toast.success('Yêu cầu đã được gửi!', {
        description: 'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được mã đặt lại mật khẩu.',
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Forgot Password error:", err);
      toast.error(err.data?.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'Vui lòng kiểm tra hộp thư của bạn để nhận hướng dẫn tiếp theo.'
                : 'Nhập email của bạn để nhận mã đặt lại mật khẩu.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <p className="text-muted-foreground">
                  Một email đã được gửi đến <span className="font-bold">{email}</span>.
                </p>
                <Button asChild className="w-full" variant="default">
                  <Link to="/reset-password" state={{ email: email }}>
                    Đi đến trang đặt lại mật khẩu
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ten@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={error ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
                  {!isLoading && <Send className="ml-2 h-4 w-4" />}
                </Button>
                <Button variant="ghost" asChild className="w-full">
                  <Link to="/auth">Hủy</Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}