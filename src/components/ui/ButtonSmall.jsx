export default function ButtonSmall({ children, onClick, color = "blue" }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs transition ${colors[color]}`}
    >
      {children}
    </button>
  );
}
