import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/dashboardSideBar';
import { DashboardHeader } from '@/components/layout/dashboardHeader';
import PaymentForm from '@/components/Payment/PaymentForm';
import PaymentSummary from '@/components/Payment/PaymentSummary';
import { Link } from 'react-router-dom';

// Định dạng tiền tệ VND (cho phần tóm tắt)
const formatVND = (amountCents) => {
  if (amountCents === 0) return 'Miễn Phí';
  // Chuyển từ cent sang đơn vị đồng (VND)
  const amountVND = amountCents / 1000; 
  return `${amountVND.toLocaleString('vi-VN')} VND`;
};

export default function Checkout() {
  // CẬP NHẬT GIÁ VÀ NHÃN: 1 Tháng Free, 6 Tháng, 12 Tháng
  const PLANS = {
    free_trial: { id: 'free_trial', label: '1 THÁNG DÙNG THỬ', displayPrice: 'Miễn Phí', amountCents: 0, tag: 'MIỄN PHÍ', duration: 1 },
    semiannual: { id: 'semiannual', label: '6 THÁNG', displayPrice: '649.000 VND', amountCents: 649000, tag: 'TIẾT KIỆM', duration: 6 },
    annual: { id: 'annual', label: '12 THÁNG', displayPrice: '1.200.000 VND', amountCents: 1200000, tag: 'TỐT NHẤT', duration: 12 },
  };

  const [selectedPlan, setSelectedPlan] = useState(PLANS.free_trial); // Mặc định chọn Gói Dùng thử
  const isTrialSelected = selectedPlan.id === 'free_trial';

  // Sắp xếp các gói theo thứ tự
  const sortedPlans = Object.values(PLANS);
  // .sort((a, b) => a.duration - b.duration); // Sắp xếp theo thời gian

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 ml-64">
        <DashboardHeader />

        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Nâng cấp lên Premium</h1>
            {/* Các mô tả tính năng giữ nguyên */}
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <li className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold">Thành viên không giới hạn</h3>
                <p className="text-sm text-muted-foreground mt-2">Mời bao nhiêu thành viên tùy thích vào workspace của bạn.</p>
              </li>
              <li className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold">Nhắn tin thảo luận</h3>
                <p className="text-sm text-muted-foreground mt-2">Trò chuyện & thảo luận trực tiếp trong project để tăng hiệu suất.</p>
              </li>
              <li className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold">Hỗ trợ & Giao diện nâng cao</h3>
                <p className="text-sm text-muted-foreground mt-2">Giao diện đồng bộ, hỗ trợ ưu tiên và nhiều tính năng chuyên nghiệp.</p>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Chọn gói</h2>

              {/* SẮP XẾP VÀ HIỂN THỊ CÁC GÓI */}
              <div className="flex gap-4 flex-wrap">
                {sortedPlans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`
                      px-5 py-3 rounded-lg border transition-all duration-200 w-full md:w-auto text-left
                      ${selectedPlan.id === p.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                        : 'bg-white text-slate-700 border-gray-300 hover:border-blue-400'}
                    `}
                  >
                    <div className="font-semibold text-lg">{p.displayPrice}</div>
                    <div className="text-sm opacity-90">{p.label}</div>
                    {p.tag && (
                      <span className={`
                        absolute top-[-10px] right-[-10px] px-2 py-0.5 text-xs font-bold rounded-full
                        ${p.id === 'free_trial' ? 'bg-yellow-400 text-black' : 
                          p.id === 'annual' ? 'bg-green-500 text-white' : 
                          'bg-indigo-500 text-white'}
                      `}>
                        {p.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* PAYMENT SUMMARY */}
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-bold text-xl mb-3">Tóm Tắt Đơn Hàng</h3>
                <PaymentSummary 
                  planName={selectedPlan.label} 
                  amountCents={selectedPlan.amountCents} 
                  displayAmount={formatVND(selectedPlan.amountCents)} // Dùng hàm formatVND mới
                  benefits={[
                    'Thành viên không giới hạn',
                    'Nhắn tin & thảo luận trong project',
                    'Hỗ trợ ưu tiên'
                  ]} 
                />
              </div>
            </div>

            {/* PHẦN THANH TOÁN / KÍCH HOẠT DÙNG THỬ */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">
                {isTrialSelected ? 'Kích hoạt Dùng thử Miễn phí' : 'Thông tin thanh toán'}
              </h2>
              
              {isTrialSelected ? (
                // Nếu chọn dùng thử miễn phí, hiển thị nút kích hoạt
                <button 
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  onClick={() => {
                    // TODO: Gọi API backend để kích hoạt 1 tháng dùng thử
                    console.log('Activating 1-month free trial...');
                    alert('Kích hoạt dùng thử thành công! Vui lòng làm mới trang.');
                  }}
                >
                  Bắt đầu Dùng thử Miễn phí ngay
                </button>
              ) : (
                // Nếu chọn gói trả phí, hiển thị PaymentForm
                <PaymentForm 
                  amountCents={selectedPlan.amountCents} 
                  amountLabel={selectedPlan.displayPrice} 
                  onSuccess={() => {
                    console.log('Payment success -> mark user premium');
                  }} 
                />
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Hoặc quay lại <Link to="/settings" className="text-blue-600 hover:underline">Cài đặt</Link></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}