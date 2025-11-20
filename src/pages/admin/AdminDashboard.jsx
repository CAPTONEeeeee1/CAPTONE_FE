import ButtonSmall from "@/components/ui/ButtonSmall";

export default function AdminDashboard() {
  const stats = [
    { title: "Người dùng", value: "1,254" },
    { title: "Boards", value: "312" },
    { title: "Giao dịch", value: "92" },
    { title: "Workspaces", value: "48" }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tổng quan hệ thống</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-gray-500 text-sm">{s.title}</div>
            <div className="mt-2 text-2xl font-bold text-gray-800">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Hoạt động gần đây</h3>

        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Admin tạo workspace mới</li>
          <li>• User A tạo board “Marketing Plan”</li>
          <li>• User B nâng cấp tài khoản Premium</li>
        </ul>
      </div>
    </div>
  );
}
