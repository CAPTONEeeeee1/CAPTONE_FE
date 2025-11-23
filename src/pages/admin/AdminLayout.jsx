import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import authService from "@/lib/authService";
import { toast } from "sonner";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { label: "User", icon: <Users size={18} />, path: "/admin/users" },
    { label: "Payment", icon: <CreditCard size={18} />, path: "/admin/payments" },
  ];

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[#E0E7FF] text-[#1E3A8A] font-medium"
      : "text-gray-600 hover:bg-gray-100";

  const handleLogout = async () => {
    try {
      // Xóa token & user ngay lập tức
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      if (authService.logout) await authService.logout();

      toast.success("Đăng xuất thành công!");

      navigate("/auth", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Có lỗi khi đăng xuất!");
    }
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm relative">
          <h1 className="text-xl font-semibold text-gray-800">
            Admin Control Panel
          </h1>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-gray-700 text-sm font-medium">
                  {user.email}
                </span>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-sm">
                    {user.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-50 animate-fade-in">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
