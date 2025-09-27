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
