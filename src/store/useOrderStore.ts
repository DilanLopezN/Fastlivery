import { create } from "zustand";
import { Order, OrderStatus } from "../types/order";
import api from "../services/api";
import { io, Socket } from "socket.io-client";

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  socket: Socket | null;
  fetchOrders: (workspaceId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  connectSocket: (workspaceId: string) => void;
  disconnectSocket: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  socket: null,

  fetchOrders: async (workspaceId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/orders?workspaceId=${workspaceId}`);
      set({
        orders: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    const updatedOrder = response.data.data;

    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? updatedOrder : order
      ),
    }));
  },

  addOrder: (order: Order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
  },

  removeOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    }));
  },

  connectSocket: (workspaceId: string) => {
    const currentSocket = get().socket;

    if (currentSocket) {
      currentSocket.disconnect();
    }

    const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3001", {
      query: { workspaceId },
    });

    socket.on("new-order", (order: Order) => {
      get().addOrder(order);
    });

    socket.on("order-updated", (updatedOrder: Order) => {
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        ),
      }));
    });

    socket.on("order-cancelled", (orderId: string) => {
      get().removeOrder(orderId);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
