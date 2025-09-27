export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "system" | "warning" | "success";
  read: boolean;
  createdAt: Date;
  workspaceId?: string;
  userId: string;
}
