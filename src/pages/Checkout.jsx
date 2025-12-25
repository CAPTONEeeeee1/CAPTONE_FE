import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/layout/dashboardSideBar';
import { DashboardHeader } from '@/components/layout/dashboardHeader';
import PaymentSummary from '@/components/Payment/PaymentSummary';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createVNPayPayment } from '@/lib/paymentService';
import workspaceService from '@/services/workspaceService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Định dạng tiền tệ VND (cho phần tóm tắt)
const formatVND = (amount) => {
  if (amount === 0) return 'Miễn Phí';
  return `${amount.toLocaleString('vi-VN')} VND`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialWorkspaceId = location.state?.workspaceId;

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await workspaceService.getAll();
        setWorkspaces(response.workspaces || []);
        if (!initialWorkspaceId && response.workspaces?.length > 0) {
          // If no workspace is passed in state, default to the first one
          setSelectedWorkspaceId(response.workspaces[0].id);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast.error("Không thể tải danh sách workspace.");
      }
    };
    fetchWorkspaces();
  }, [initialWorkspaceId]);

  const PLANS = {
    monthly: { id: 'monthly', label: '1 THÁNG', displayPrice: '149.000 VND', amount: 149000, tag: 'CƠ BẢN', duration: 1 },
    semiannual: { id: 'semiannual', label: '6 THÁNG', displayPrice: '649.000 VND', amount: 649000, tag: 'PHỔ THÔNG', duration: 6 },
    annual: { id: 'annual', label: '12 THÁNG', displayPrice: '1.200.000 VND', amount: 1200000, tag: 'TIẾT KIỆM', duration: 12 },
  };

  const [selectedPlan, setSelectedPlan] = useState(PLANS.monthly);

  const sortedPlans = Object.values(PLANS);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (!selectedWorkspaceId) {
        toast.error("Vui lòng chọn một workspace để nâng cấp.");
        return;
      }

      const paymentData = {
        amount: selectedPlan.amount,
        orderInfo: `Thanh toán cho gói ${selectedPlan.label} của workspace ${selectedWorkspaceId}`,
        workspaceId: selectedWorkspaceId,
        plan: selectedPlan.id,
      };

      const response = await createVNPayPayment(paymentData);

      if (response && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        toast.error('Không thể tạo URL thanh toán. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi tạo thanh toán:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi xử lý thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />

      <div className="flex-1 ml-64">
        <DashboardHeader />

        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Nâng cấp lên Premium</h1>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <li className="border rounded-lg p-4 bg-card shadow-sm">
                <h3 className="font-semibold">Thành viên không giới hạn</h3>
                <p className="text-sm text-muted-foreground mt-2">Mời bao nhiêu thành viên tùy thích vào workspace của bạn.</p>
              </li>
              <li className="border rounded-lg p-4 bg-card shadow-sm">
                <h3 className="font-semibold">Nhắn tin thảo luận</h3>
                <p className="text-sm text-muted-foreground mt-2">Trò chuyện & thảo luận trực tiếp trong project để tăng hiệu suất.</p>
              </li>
              <li className="border rounded-lg p-4 bg-card shadow-sm">
                <h3 className="font-semibold">Hỗ trợ & Giao diện nâng cao</h3>
                <p className="text-sm text-muted-foreground mt-2">Giao diện đồng bộ, hỗ trợ ưu tiên và nhiều tính năng chuyên nghiệp.</p>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-select">Chọn workspace để nâng cấp</Label>
                <Select
                  value={selectedWorkspaceId}
                  onValueChange={setSelectedWorkspaceId}
                  id="workspace-select"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn một workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map(ws => (
                      <SelectItem key={ws.id} value={ws.id}>
                        <div className="flex items-center">
                          <span>{ws.name}</span>
                          <Badge variant={ws.plan === 'PREMIUM' ? 'default' : 'secondary'} className="ml-2">
                            {ws.plan === 'PREMIUM' ? 'Premium' : 'Normal'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <h2 className="text-lg font-medium">Chọn gói</h2>

              <div className="flex gap-4 flex-wrap">
                {sortedPlans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`
                      px-5 py-3 rounded-lg border transition-all duration-200 w-full md:w-auto text-left relative
                      ${selectedPlan.id === p.id 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                        : 'bg-card text-card-foreground border-border hover:border-primary'}
                    `}
                  >
                    <div className="font-semibold text-lg">{p.displayPrice}</div>
                    <div className="text-sm opacity-90">{p.label}</div>
                    {p.tag && (
                      <span className={`
                        absolute top-[-10px] right-[-10px] px-2 py-0.5 text-xs font-bold rounded-full
                        ${p.id === 'monthly' ? 'bg-yellow-400 text-black' : 
                          p.id === 'annual' ? 'bg-green-500 text-white' : 
                          'bg-indigo-500 text-white'}
                      `}>
                        {p.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-bold text-xl mb-3">Tóm Tắt Đơn Hàng</h3>
                <PaymentSummary 
                  planName={selectedPlan.label} 
                  displayAmount={formatVND(selectedPlan.amount)}
                  benefits={[
                    'Thành viên không giới hạn',
                    'Nhắn tin & thảo luận trong project',
                    'Hỗ trợ ưu tiên'
                  ]} 
                />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">
                Thanh toán
              </h2>
              
              <div className="space-y-4">
                <Button 
                  onClick={handlePayment} 
                  className="w-full" 
                  disabled={isProcessing || !selectedWorkspaceId}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Thanh toán qua VNPAY'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Bạn sẽ được chuyển hướng đến cổng thanh toán VNPAY để hoàn tất giao dịch.</p>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Hoặc quay lại <Link to="/workspaces" className="text-primary hover:underline">Workspace</Link></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}