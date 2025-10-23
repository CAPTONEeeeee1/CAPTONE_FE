import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// =======================================================
// === MOCK/STANDALONE AUTH SERVICE CHO CHỨC NĂNG CALLBACK ===
// === (Dùng để tránh lỗi import "../lib/authService") ===
// =======================================================
const MOCK_AUTH_SERVICE = {
    saveTokens: (accessToken, refreshToken) => {
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    },
};
// =======================================================


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

    if (accessToken && refreshToken) {
      // 2. LƯU token vào localStorage 
      MOCK_AUTH_SERVICE.saveTokens(accessToken, refreshToken); 
      
      toast.success('Đăng nhập thành công với Google!');
      
      // 3. Chuyển hướng đến trang chính
      navigate('/dashboard', { replace: true });
    } else {
      // Trường hợp không có token nào được tìm thấy 
      toast.error('Lỗi xác thực: Không tìm thấy mã thông báo.');
      navigate('/auth', { replace: true }); // Sửa lỗi: Chuyển hướng về /auth
    }
  }, [navigate]);

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