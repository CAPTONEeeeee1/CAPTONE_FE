import { useEffect, useState } from "react";
import adminService from "@/lib/adminService";

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-800">
        {value ?? "--"}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then((data) => {
        // BE: { stats: {...}, recentActivities: [...] }
        setStats(data.stats);
        setRecentActivities(data.recentActivities || []);
      })
      .catch((err) => {
        console.error("Admin stats error:", err);
        alert(err.message || "Không tải được thống kê hệ thống.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Lỗi tải dữ liệu</div>;

  const userStats = stats.users || {};

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={userStats.total} />
        <StatCard label="Active Users" value={userStats.active} />
        <StatCard label="Suspended Users" value={userStats.suspended} />
        <StatCard label="Workspaces" value={stats.workspaces} />
        <StatCard label="Boards" value={stats.boards} />
        <StatCard label="Cards" value={stats.cards} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Activities
          </h2>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((a) => (
              <tr key={a.id} className="border-b last:border-none">
                <td className="px-4 py-2">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {a.user?.fullName || a.user?.email || "Unknown"}
                </td>
                <td className="px-4 py-2">{a.action}</td>
              </tr>
            ))}

            {recentActivities.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  Chưa có activity nào gần đây.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
