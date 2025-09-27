export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}
