import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/dashboardSideBar';
import { DashboardHeader } from '@/components/layout/dashboardHeader';
import PaymentForm from '@/components/Payment/PaymentForm';
import PaymentSummary from '@/components/Payment/PaymentSummary';
import { Link } from 'react-router-dom';

export default function Checkout() {
  // Giá hiển thị và amountCents để processPayment (mock)
  const PLANS = {
    monthly: { id: 'monthly', label: '150 / 1 tháng', amountCents: 15000 }, // bạn có thể thay amountCents tùy backend
    semiannual: { id: 'semiannual', label: '699 / 6 tháng', amountCents: 69900 },
  };

  const [selectedPlan, setSelectedPlan] = useState(PLANS.monthly);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 ml-64">
        <DashboardHeader />

        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Nâng cấp lên Premium</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Nâng cấp lên Premium để tận hưởng trải nghiệm tốt hơn:
            </p>

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

              <div className="flex gap-3">
                {Object.values(PLANS).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`px-4 py-2 rounded-lg border ${selectedPlan.id === p.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700'} shadow-sm`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <PaymentSummary planName="Premium" amountCents={selectedPlan.amountCents} benefits={[
                  'Thành viên không giới hạn',
                  'Nhắn tin & thảo luận trong project',
                  'Hỗ trợ ưu tiên'
                ]} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Thông tin thanh toán</h2>
              <PaymentForm amountCents={selectedPlan.amountCents} amountLabel={selectedPlan.label} onSuccess={() => {
                // TODO: gọi API backend để cập nhật trạng thái user -> premium
                // navigate hoặc hiển thị thông báo
                console.log('payment success -> mark user premium');
              }} />
              <p className="text-xs text-muted-foreground mt-3">
                Lưu ý: Mã thẻ mock: dùng số thẻ bắt đầu bằng "4" để thử thanh toán (mock).
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Hoặc quay lại <Link to="/settings" className="text-blue-600">Cài đặt</Link></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}