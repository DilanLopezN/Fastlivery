import React, { useState } from "react";
import { ChevronDown, ChevronRight, Eye, MapPin } from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Order } from "../../types/order";
import StatusBadge from "../ui/StatusBadge";

interface OrderCardProps {
  order: Order;
  onStatusChange: (order: Order) => void;
  onView: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  onView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTimeColor = (minutes: number): string => {
    if (minutes > 30) return "text-red-600";
    if (minutes > 15) return "text-yellow-600";
    return "text-green-600";
  };

  const formattedTime = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">
                #{order.number}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-600">{order.customer}</p>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-medium ${getTimeColor(order.waitTime)}`}
            >
              {order.waitTime} min
            </p>
            <p className="text-xs text-gray-500">{formattedTime}</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-sm font-bold text-gray-900">
              R${" "}
              {order.total.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {order.type === "delivery" && order.address && (
            <div className="flex items-start gap-1 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{order.address}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
            Itens ({order.items.length})
          </button>

          <button
            onClick={() => onView(order)}
            className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button
              onClick={() => onStatusChange(order)}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              Avançar
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-900 font-medium">
                    R${" "}
                    {item.price.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>Obs:</strong> {order.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
