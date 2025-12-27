import { io } from "socket.io-client";
import { API_BASE_URL } from "../lib/api";

class BoardSocketService {
  socket = null;

  connect(boardId) {
    if (this.socket && this.socket.connected) {
      this.joinBoard(boardId);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Socket.IO: No auth token found.");
      return;
    }

    this.socket = io(`${API_BASE_URL}/board`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Connected to board socket:", this.socket.id);
      this.joinBoard(boardId);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Board socket connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from board socket:", reason);
    });
  }

  joinBoard(boardId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_board", boardId);
      console.log(`Attempting to join board: ${boardId}`);
    }
  }

  leaveBoard(boardId) {
    if (this.socket) {
      this.socket.emit("leave_board", boardId);
      console.log(`Leaving board: ${boardId}`);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  onCardMoved(handler) {
    if (this.socket) {
      this.socket.on("card_moved", handler);
    }
  }

  onListsReordered(handler) {
    if (this.socket) {
      this.socket.on("lists_reordered", handler);
    }
  }

  off(eventName) {
    if (this.socket) {
        this.socket.off(eventName);
    }
  }
}

const boardSocketService = new BoardSocketService();
export default boardSocketService;
