import React, { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

import { useOrderStore } from "../store/useOrderStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "../types/order";
import Layout from "../components/layout/layout";
import StatsCard from "../components/dashboard/Statscard";
import OrderCard from "../components/order/OrderCard";

interface StatusColumn {
  key: OrderStatus;
  label: string;
  color: string;
  count: number;
}

const Dashboard: React.FC = () => {
  const { orders, fetchOrders, updateOrderStatus, isLoading } = useOrderStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusColumns: StatusColumn[] = [
    {
      key: "pending",
      label: "Pendentes",
      color: "border-yellow-400",
      count: 0,
    },
    {
      key: "preparing",
      label: "Preparando",
      color: "border-blue-400",
      count: 0,
    },
    { key: "ready", label: "Prontos", color: "border-green-400", count: 0 },
    {
      key: "delivered",
      label: "Entregues",
      color: "border-gray-400",
      count: 0,
    },
  ];

  // Contar pedidos por status
  statusColumns.forEach((column) => {
    column.count = orders.filter((order) => order.status === column.key).length;
  });

  useEffect(() => {
    if (currentWorkspace) {
      fetchOrders(currentWorkspace.id);
    }
  }, [currentWorkspace, fetchOrders]);

  const handleStatusChange = async (order: Order) => {
    const statusFlow: OrderStatus[] = [
      "pending",
      "preparing",
      "ready",
      "delivered",
    ];
    const currentIndex = statusFlow.indexOf(order.status);

    if (currentIndex < statusFlow.length - 1) {
      try {
        await updateOrderStatus(order.id, statusFlow[currentIndex + 1]);
        toast.success(`Pedido #${order.number} atualizado!`);
      } catch (error) {
        toast.error("Erro ao atualizar status");
      }
    }
  };

  const handleRefresh = async () => {
    if (currentWorkspace && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await fetchOrders(currentWorkspace.id);
        toast.success("Pedidos atualizados");
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  const handleViewOrder = (order: Order) => {
    console.log("Visualizar pedido:", order);
    // Implementar modal de detalhes
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "all" && order.status !== selectedStatus)
      return false;
    if (
      searchTerm &&
      !order.number.includes(searchTerm) &&
      !order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = {
    todayOrders: orders.length,
    avgTime: 18,
    revenue: 8423.5,
    completionRate: 96,
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Central de Pedidos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {currentWorkspace?.name || "Selecione um workspace"}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Pedidos Hoje"
            value={stats.todayOrders}
            change="+12%"
            changeType="positive"
            icon={Package}
            color="blue"
          />
          <StatsCard
            title="Tempo Médio"
            value={`${stats.avgTime} min`}
            change="-3 min"
            changeType="positive"
            icon={Clock}
            color="green"
          />
          <StatsCard
            title="Faturamento"
            value={`R$ ${stats.revenue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
            change="+18%"
            changeType="positive"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Taxa Conclusão"
            value={`${stats.completionRate}%`}
            change="-1%"
            changeType="negative"
            icon={CheckCircle}
            color="yellow"
          />
        </div>

        {/* Filters Bar */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as OrderStatus | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Prontos</option>
              <option value="delivered">Entregues</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {statusColumns.map((column) => (
              <motion.div
                key={column.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg border-t-4 ${column.color} shadow-sm`}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {column.label}
                    </h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {column.count}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto scrollbar-custom">
                  <AnimatePresence>
                    {filteredOrders
                      .filter((order) => order.status === column.key)
                      .map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <OrderCard
                            order={order}
                            onStatusChange={handleStatusChange}
                            onView={handleViewOrder}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>

                  {filteredOrders.filter((order) => order.status === column.key)
                    .length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhum pedido</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
