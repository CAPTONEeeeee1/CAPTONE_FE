import React, { useEffect, useState } from "react";
import adminService from "@/lib/adminService";
import ButtonSmall from "@/components/ui/ButtonSmall";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchPayments = () => {
    setLoading(true);
    adminService
      .getPayments({
        page,
        limit: 20,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      .then((data) => {
        setPayments(data.payments || []);
        setPagination(data.pagination || null);
        setTotalRevenue(data.totalRevenue || 0);
      })
      .catch((err) => {
        console.error("Admin payments error:", err);
        toast.error(err.message || "Không tải được danh sách thanh toán.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  if (loading && payments.length === 0) return <div>Loading...</div>;

  return (
    <div className="space-y-4 text-gray-900">
      <h2 className="text-2xl font-semibold">Quản lý thanh toán</h2>

      {/* Filter */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap gap-3 items-center"
      >
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Tìm theo email hoặc tên workspace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2 text-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2 text-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <ButtonSmall type="submit">Filter</ButtonSmall>
      </form>

      {/* Total Revenue */}
      <div className="text-lg font-semibold">
        Tổng doanh thu:{" "}
        <span className="text-green-700">
          {totalRevenue.toLocaleString("vi-VN")} ₫
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Workspace</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Plan</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                {/* User */}
                <td className="px-4 py-2">
                  <div>
                    <div className="font-medium">{p.userName}</div>
                    <div className="text-xs text-gray-600">{p.userEmail}</div>
                  </div>
                </td>

                {/* Workspace */}
                <td className="px-4 py-2">
                  {p.workspaceName || "Không xác định"}
                </td>

                {/* Amount */}
                <td className="px-4 py-2 font-semibold text-green-700">
                  {p.amount != null
                    ? `${p.amount.toLocaleString("vi-VN")} ₫`
                    : "—"}
                </td>

                {/* Status */}
                <td className="px-4 py-2">
                  <span
                    className={
                      p.status === "SUCCESS"
                        ? "text-green-600 font-semibold"
                        : p.status === "FAILED"
                        ? "text-red-600 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }
                  >
                    {p.status}
                  </span>
                </td>

                {/* Plan */}
                <td className="px-4 py-2">
                  {p.planLabel || "Không xác định"}
                </td>

                {/* Created */}
                <td className="px-4 py-2">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
              </tr>
            ))}

            {payments.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  Không có giao dịch nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <ButtonSmall
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </ButtonSmall>
          <ButtonSmall
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
          >
            Next
          </ButtonSmall>
        </div>
      )}
    </div>
  );
}
