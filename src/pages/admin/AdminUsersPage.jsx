import { useState } from "react";
import ButtonSmall from "@/components/ui/ButtonSmall";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "a@gmail.com",
      role: "USER",
      accountType: "Thường",
    },
    {
      id: 2,
      name: "Nguyễn Văn B",
      email: "b@gmail.com",
      role: "USER",
      accountType: "Premium",
    },
    {
      id: 3,
      name: "Admin",
      email: "admin@plannex.com",
      role: "ADMIN",
      accountType: "Thường",
    },
  ]);

  const [editingUser, setEditingUser] = useState(null);

  const handleDelete = (id) => {
    if (confirm("Bạn chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleSaveEdit = () => {
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Quản lý người dùng
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Vai trò</th>
              <th className="px-4 py-3 text-left">Tài khoản</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-md text-xs ${
                      u.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-md text-xs ${
                      u.accountType === "Premium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.accountType}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <ButtonSmall
                      color="blue"
                      onClick={() => setEditingUser({ ...u })}
                    >
                      Sửa
                    </ButtonSmall>
                    <ButtonSmall
                      color="red"
                      onClick={() => handleDelete(u.id)}
                    >
                      Xóa
                    </ButtonSmall>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="text-lg font-semibold">Chỉnh sửa người dùng</h3>

            <div className="space-y-1">
              <label className="text-sm text-gray-700">Tên</label>
              <input
                className="border w-full px-3 py-2 rounded-md"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-700">Vai trò</label>
              <select
                className="border w-full px-3 py-2 rounded-md"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {/* Loại tài khoản */}
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Tài khoản</label>
              <select
                className="border w-full px-3 py-2 rounded-md"
                value={editingUser.accountType}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    accountType: e.target.value,
                  })
                }
              >
                <option value="Thường">Thường</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <ButtonSmall color="gray" onClick={() => setEditingUser(null)}>
                Hủy
              </ButtonSmall>
              <ButtonSmall color="blue" onClick={handleSaveEdit}>
                Lưu
              </ButtonSmall>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
