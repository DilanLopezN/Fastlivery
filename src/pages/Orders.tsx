import React, { useState } from "react";

import { Search, Filter, Download, Plus } from "lucide-react";

import { useOrderStore } from "../store/useOrderStore";

import toast from "react-hot-toast";
import type { Order } from "../types/order";
import Layout from "../components/layout/layout";
import OrderCard from "../components/order/OrderCard";

const Orders: React.FC = () => {
  const { orders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = async (order: Order) => {
    const statusFlow = ["pending", "preparing", "ready", "delivered"] as const;
    if (!statusFlow.includes(order.status as any)) {
      toast.error("Status do pedido não pode ser atualizado.");
      return;
    }
    const currentIndex = statusFlow.indexOf(
      order.status as (typeof statusFlow)[number]
    );

    if (currentIndex < statusFlow.length - 1) {
      try {
        await updateOrderStatus(order.id, statusFlow[currentIndex + 1]);
        toast.success(`Pedido #${order.number} atualizado!`);
      } catch (error) {
        toast.error("Erro ao atualizar status");
      }
    }
  };

  const handleViewOrder = (order: Order) => {
    console.log("Visualizar pedido:", order);
  };

  const filteredOrders = orders.filter((order) => {
    if (
      searchTerm &&
      !order.number.includes(searchTerm) &&
      !order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie todos os pedidos do restaurante
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Novo Pedido
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar pedido ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onView={handleViewOrder}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
