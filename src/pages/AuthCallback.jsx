import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiClient from '@/lib/api'; // *** SỬA LỖI: Import apiClient để gọi API ***
import authService from '@/lib/authService'; // *** SỬA LỖI: Import authService thật ***


export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Lấy token và lỗi từ URL
    const urlParams = new URLSearchParams(window.location.search); 
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');

    if (error) {
      // Sửa lỗi: Chuyển hướng về /auth thay vì /login
      toast.error(`Đăng nhập thất bại: ${error.replace('_', ' ')}`);
      navigate('/auth', { replace: true }); 
      return;
    }

    const handleGoogleLogin = async () => {
      if (accessToken && refreshToken) {
        try {
          // 2. LƯU token vào localStorage
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // 3. GỌI API /me ĐỂ LẤY VÀ LƯU THÔNG TIN USER
          // *** SỬA LỖI: Bỏ tiền tố /api để khớp với cấu hình backend ***
          const response = await apiClient.get('/auth/me');
          const user = response.user || response.data?.user;

          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            throw new Error("Không thể lấy thông tin người dùng.");
          }

          toast.success('Đăng nhập thành công với Google!');
          
          // 4. Chuyển hướng đến trang chính
          navigate('/dashboard', { replace: true });
        } catch (err) {
          toast.error(err.message || 'Lỗi xác thực sau khi đăng nhập Google.');
          authService.logout(); // Dọn dẹp token nếu có lỗi
          navigate('/auth', { replace: true });
        }
      } else {
      // Trường hợp không có token nào được tìm thấy 
      toast.error('Lỗi xác thực: Không tìm thấy mã thông báo.');
      navigate('/auth', { replace: true }); // Sửa lỗi: Chuyển hướng về /auth
    }} // *** SỬA LỖI: Thêm dấu } để đóng hàm handleGoogleLogin ***

    handleGoogleLogin();

  }, [navigate]);
   // Phụ thuộc không thay đổi

  // Hiển thị một giao diện loading trong khi xử lý
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-6 bg-card rounded-xl shadow-lg">
        <svg 
            className="animate-spin h-8 w-8 text-primary mx-auto mb-3" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
        >
          <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
          />
          <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm font-medium text-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}