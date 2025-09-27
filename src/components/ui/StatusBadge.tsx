import React from "react";
import { Clock, Package, CheckCircle, XCircle } from "lucide-react";
import type { OrderStatus } from "../../types/order";

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      label: "Pendente",
    },
    preparing: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Package,
      label: "Preparando",
    },
    ready: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      label: "Pronto",
    },
    delivered: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: CheckCircle,
      label: "Entregue",
    },
    cancelled: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      label: "Cancelado",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

export default StatusBadge;
