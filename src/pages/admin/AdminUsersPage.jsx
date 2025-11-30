import React, { useEffect, useState } from "react";
import adminService from "@/lib/adminService";
import ButtonSmall from "@/components/ui/ButtonSmall";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    adminService
      .getUsers({ page, limit: 20, search: search || undefined })
      .then((data) => {
        setUsers(data.users || []);
        setPagination(data.pagination || null);
      })
      .catch((err) => {
        console.error("Admin users error:", err);
        toast.error(err.message || "Không tải được danh sách người dùng.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Xóa người dùng thành công!");
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error(err.message || "Xóa người dùng thất bại.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSaveEdit = async () => {
    try {

      if (editingUser._dirtyRole)
        await adminService.updateUserRole(editingUser.id, editingUser.role);

      if (editingUser._dirtyStatus)
        await adminService.updateUserStatus(editingUser.id, editingUser.status);

      await adminService.updateUserInfo(editingUser.id, {
        fullName: editingUser.fullName,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );

      setEditingUser(null);
      toast.success("Cập nhật người dùng thành công!");
    } catch (err) {
      console.error("Update user error:", err);
      toast.error(err.message || "Cập nhật người dùng thất bại.");
    }
  };

  if (loading && users.length === 0) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Quản lý người dùng</h2>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap gap-3 items-center"
      >
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonSmall type="submit">Filter</ButtonSmall>
      </form>

      {/* Bảng */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Workspaces</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-none">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {u.avatar && (
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{u.fullName}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.status}</td>
                <td className="px-4 py-2">
                  {u._count?.ownedWorkspaces || 0} owned /{" "}
                  {u._count?.workspaceMemberships || 0} member
                </td>
                <td className="px-4 py-2">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <ButtonSmall
                    onClick={() =>
                      setEditingUser({
                        ...u,
                        _dirtyRole: false,
                        _dirtyStatus: false,
                      })
                    }
                  >
                    Edit
                  </ButtonSmall>
                  <ButtonSmall
                    variant="danger"
                    onClick={() => setConfirmDeleteId(u.id)}
                  >
                    Delete
                  </ButtonSmall>
                </td>
              </tr>
            ))}

            {users.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full space-y-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Xác nhận xóa tài khoản
            </h3>
            <p className="text-gray-600 text-sm">
              Bạn có chắc chắn muốn xóa người dùng này không? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold">Sửa người dùng</h3>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Full name</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={editingUser.fullName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, fullName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Role</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value,
                    _dirtyRole: true,
                  })
                }
              >
                <option value="USER">user</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Status</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={editingUser.status}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    status: e.target.value,
                    _dirtyStatus: true,
                  })
                }
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <ButtonSmall onClick={() => setEditingUser(null)}>Hủy</ButtonSmall>
              <ButtonSmall onClick={handleSaveEdit}>Lưu</ButtonSmall>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
