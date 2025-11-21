import { useState } from "react";
import ButtonSmall from "@/components/ui/ButtonSmall";

export default function AdminBoardsPage() {
  const [boards, setBoards] = useState([
    { id: 1, name: "Marketing Board", owner: "an@gmail.com", visibility: "Public" },
    { id: 2, name: "Dev Team Board", owner: "admin@plannex.com", visibility: "Private" },
  ]);

  const [editingBoard, setEditingBoard] = useState(null);

  const handleDelete = (id) => {
    if (confirm("Xóa board này?")) {
      setBoards(boards.filter(b => b.id !== id));
    }
  };

  const handleSave = () => {
    setBoards(boards.map(b => (b.id === editingBoard.id ? editingBoard : b)));
    setEditingBoard(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quản lý Boards</h2>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Tên board</th>
              <th className="px-4 py-3 text-left">Chủ sở hữu</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {boards.map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{b.name}</td>
                <td className="px-4 py-3">{b.owner}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    b.visibility === "Public"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {b.visibility}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <ButtonSmall color="blue" onClick={() => setEditingBoard({ ...b })}>Sửa</ButtonSmall>
                  <ButtonSmall color="red" onClick={() => handleDelete(b.id)}>Xóa</ButtonSmall>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {editingBoard && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h3 className="text-lg font-semibold">Sửa Board</h3>

            <input
              className="border w-full px-3 py-2 rounded-md"
              value={editingBoard.name}
              onChange={(e) =>
                setEditingBoard({ ...editingBoard, name: e.target.value })
              }
            />

            <select
              className="border w-full px-3 py-2 rounded-md"
              value={editingBoard.visibility}
              onChange={(e) =>
                setEditingBoard({ ...editingBoard, visibility: e.target.value })
              }
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>

            <div className="flex justify-end gap-2">
              <ButtonSmall color="gray" onClick={() => setEditingBoard(null)}>
                Hủy
              </ButtonSmall>
              <ButtonSmall color="blue" onClick={handleSave}>
                Lưu
              </ButtonSmall>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
