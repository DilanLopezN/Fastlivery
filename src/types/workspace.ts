export interface Workspace {
  id: string;
  name: string;
  logo: string;
  address?: string;
  phone?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: WorkspaceSettings;
}

export interface WorkspaceSettings {
  autoAcceptOrders: boolean;
  notificationSound: boolean;
  printAutomatically: boolean;
  orderTimeout: number; // em minutos
  deliveryFee: number;
  taxRate: number;
}

// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "operator";
  avatar?: string;
  workspaces: string[]; // IDs dos workspaces
  createdAt: Date;
  updatedAt: Date;
}
