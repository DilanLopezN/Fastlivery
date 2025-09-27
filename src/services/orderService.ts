import api from "./api";
import { type Order, type OrderStatus } from "../types/order";
import { type PaginatedResponse } from "../types/api";

interface OrderFilters {
  workspaceId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

class OrderService {
  async getOrders(filters: OrderFilters): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();

    if (filters.workspaceId) params.append("workspaceId", filters.workspaceId);
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    const response = await api.post("/orders", data);
    return response.data.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data.data;
  }

  async printOrder(id: string): Promise<void> {
    await api.post(`/orders/${id}/print`);
  }
}

export default new OrderService();
