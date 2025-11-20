import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CreditCard,
  LogOut,
} from "lucide-react";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const menu = [
    { label: "Tổng quan", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { label: "Người dùng", icon: <Users size={18} />, path: "/admin/users" },
    { label: "Boards", icon: <KanbanSquare size={18} />, path: "/admin/boards" },
    { label: "Thanh toán", icon: <CreditCard size={18} />, path: "/admin/payments" },
  ];

  const isActive = (path) =>
    pathname === path
      ? "bg-[#E0E7FF] text-[#1E3A8A] font-medium"
      : "text-gray-600 hover:bg-gray-100";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 px-2 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-sm">
            P
          </div>
          <span className="text-xl font-semibold text-gray-800 tracking-wide">
            PlanNex Admin
          </span>
        </div>

        <nav className="mt-4 space-y-1 flex-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive(
                item.path
              )}`}
            >
              {item.icon}
              <span className="text-[15px]">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 mt-4 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Admin Control Panel</h1>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">{user?.email}</span>
            <div className="w-9 h-9 rounded-full bg-gray-300" />
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
