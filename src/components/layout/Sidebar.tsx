import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Store,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useAuthStore } from "../../store/useAuthStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { currentWorkspace, setCurrentWorkspace, workspaces } =
    useWorkspaceStore();
  const { user, logout } = useAuthStore();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Package, label: "Pedidos", path: "/orders", badge: "12" },
    { icon: Store, label: "Produtos", path: "/products" },
    { icon: Users, label: "Clientes", path: "/customers" },
    { icon: TrendingUp, label: "Relatórios", path: "/reports" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header com botão de fechar no mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="text-white font-bold">Menu</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Workspace Selector */}
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {currentWorkspace?.logo || "🏢"}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {currentWorkspace?.name || "Selecione um workspace"}
                    </p>
                    <p className="text-xs text-gray-400">Workspace ativo</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showWorkspaceMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showWorkspaceMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-10">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        setCurrentWorkspace(workspace);
                        setShowWorkspaceMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors ${
                        currentWorkspace?.id === workspace.id
                          ? "bg-gray-700"
                          : ""
                      }`}
                    >
                      <span className="text-xl">{workspace.logo}</span>
                      <span className="text-sm text-white">
                        {workspace.name}
                      </span>
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors border-t border-gray-700">
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Criar novo workspace
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.role || "Admin"}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
