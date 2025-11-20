import React, { useState } from "react";
import ButtonSmall from "@/components/ui/ButtonSmall"

export default function AdminPaymentsPage() {
  const [payments] = useState([
    { id: 1, user: "a@gmail.com", amount: 99000, status: "Success" },
    { id: 2, user: "b@gmail.com", amount: 99000, status: "Pending" },
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Giao dịch thanh toán
      </h2>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Người dùng</th>
              <th className="px-4 py-3 text-left">Số tiền</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{p.user}</td>
                <td className="px-4 py-3">{p.amount.toLocaleString()}đ</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Khối hiển thị chi tiết phía dưới (click Xem mới hiện) */}
      {selectedPayment && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-xl border">
          <h3 className="text-lg font-semibold mb-2">Chi tiết giao dịch</h3>
          <p>
            <strong>Người dùng:</strong> {selectedPayment.user}
          </p>
          <p>
            <strong>Số tiền:</strong>{" "}
            {selectedPayment.amount.toLocaleString()}đ
          </p>
          <p>
            <strong>Trạng thái:</strong> {selectedPayment.status}
          </p>

          <button
            onClick={() => setSelectedPayment(null)}
            className="mt-3 px-3 py-1 bg-gray-300 rounded-md text-xs"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
