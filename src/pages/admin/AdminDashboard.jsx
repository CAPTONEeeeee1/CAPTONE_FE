import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import adminService from "@/lib/adminService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

function getInitials(name = "") {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // State for filter inputs
  const [searchInput, setSearchInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const fetchAndSetData = (page, search, startDate, endDate) => {
    setLoading(true);
    adminService
      .getStats({
        page,
        limit: 10,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      .then((data) => {
        setStats(data.stats);
        setRecentActivities(data.recentActivities || []);
        const totalPages = Math.min(50, data.pagination.totalPages);
        setPagination({ ...data.pagination, totalPages });
      })
      .catch((err) => {
        console.error("Admin stats error:", err);
        toast.error(err.message || "Không tải được thống kê hệ thống.");
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchAndSetData(currentPage, searchInput, startDateInput, endDateInput);
  }, [currentPage]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchAndSetData(1, searchInput, startDateInput, endDateInput);
    } else {
      setCurrentPage(1);
    }
  };

  if (loading && !stats) return <div>Loading...</div>;
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
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Activities
          </h2>
        </div>
        
        <form
          onSubmit={handleFilterSubmit}
          className="p-4 bg-slate-50 border-b border-gray-200"
        >
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search Group */}
            <div className="flex-grow min-w-[250px]">
              <label htmlFor="search-input" className="text-xs font-medium text-gray-600">Tìm theo User</label>
              <Input
                id="search-input"
                placeholder="Email hoặc tên user..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            {/* Date Group */}
            <div>
              <label className="text-xs font-medium text-gray-600">Lọc theo ngày</label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                />
              </div>
            </div>

            {/* Button */}
            <div>
              <Button type="submit">Filter</Button>
            </div>
          </div>
        </form>

        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Workspace</th>
              <th className="px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  Loading activities...
                </td>
              </tr>
            )}
            {!loading && recentActivities.map((a) => (
              <tr key={a.id} className="border-b last:border-none hover:bg-slate-50">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={a.user?.avatar} alt={a.user?.fullName} />
                      <AvatarFallback>{getInitials(a.user?.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{a.user?.fullName}</div>
                      <div className="text-xs text-gray-500">{a.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">{a.action}</td>
                <td className="px-4 py-2 text-gray-600">
                  {a.workspace ? (
                    <span className="font-mono text-xs p-1 bg-gray-100 rounded">{a.workspace.name}</span>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!loading && recentActivities.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No activities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!pagination.hasMore || currentPage >= 50}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

