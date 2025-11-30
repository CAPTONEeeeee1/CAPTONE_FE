import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import authService from '@/lib/authService';
import { toast } from 'sonner';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!/^\d{6}$/.test(formData.code)) {
      newErrors.code = 'Mã OTP phải là 6 chữ số.';
    }
    if (formData.newPassword.length < 12) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 12 ký tự.';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        ...formData,
      });
      toast.success('Mật khẩu đã được đặt lại thành công!', {
        description: 'Bây giờ bạn có thể đăng nhập với mật khẩu mới.',
      });
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      console.error('Reset Password error:', err);
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
            <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
            <CardDescription>
              Nhập mã OTP đã nhận và mật khẩu mới cho tài khoản <span className="font-bold">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã OTP</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleChange} placeholder="123456" maxLength={6} className={errors.code ? 'border-destructive' : ''} />
                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input id="newPassword" name="newPassword" type={showPassword ? 'text' : 'password'} value={formData.newPassword} onChange={handleChange} placeholder="••••••••••••" className={errors.newPassword ? 'border-destructive' : ''} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••••••" className={errors.confirmPassword ? 'border-destructive' : ''} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                {!isLoading && <KeyRound className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}