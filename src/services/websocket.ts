import { io, Socket } from "socket.io-client";
import { type Order } from "../types/order";
import { type Notification } from "../types/notification";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(workspaceId: string): void {
    if (this.socket?.connected) {
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3001";
    const token = localStorage.getItem("token");

    this.socket = io(WS_URL, {
      query: { workspaceId },
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket conectado");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket desconectado:", reason);
      if (reason === "io server disconnect") {
        // Servidor forçou desconexão, tentar reconectar
        this.reconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Erro de conexão WebSocket:", error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Máximo de tentativas de reconexão atingido");
        this.disconnect();
      }
    });
  }

  private reconnect(): void {
    setTimeout(() => {
      console.log("Tentando reconectar WebSocket...");
      this.socket?.connect();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  onNewOrder(callback: (order: Order) => void): void {
    this.socket?.on("new-order", callback);
  }

  onOrderUpdated(callback: (order: Order) => void): void {
    this.socket?.on("order-updated", callback);
  }

  onOrderCancelled(callback: (orderId: string) => void): void {
    this.socket?.on("order-cancelled", callback);
  }

  onNotification(callback: (notification: Notification) => void): void {
    this.socket?.on("notification", callback);
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
