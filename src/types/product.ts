export interface ProductAdditional {
  id: string;
  name: string;
  price: number;
  required: boolean;
  maxQuantity?: number;
  options?: AdditionalOption[];
}

export interface AdditionalOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductRemoval {
  id: string;
  name: string;
  removable: boolean;
}

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

  // Novos campos
  additionals: ProductAdditional[];
  removals: ProductRemoval[];
  preparationTime?: number; // em minutos
  calories?: number;
  allergens?: string[];
  tags?: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  workspaceId: string;
  active: boolean;
}

export interface ProductCombo {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice: number;
  discount: number;
  available: boolean;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;

  // Produtos que compõem o combo
  items: ComboItem[];

  // Opcionais
  validUntil?: Date;
  minItems?: number;
  maxItems?: number;
}

export interface ComboItem {
  productId: string;
  product: Product;
  quantity: number;
  required: boolean;
  category?: string;
}

export interface ProductPromotion {
  id: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed" | "bogo" | "combo";
  value: number; // Porcentagem ou valor fixo
  workspaceId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Período de validade
  startDate: Date;
  endDate: Date;

  // Condições
  minOrderValue?: number;
  maxUses?: number;
  currentUses: number;
  applicableProducts: string[]; // IDs dos produtos
  applicableCategories: string[]; // IDs das categorias

  // Dias e horários válidos
  validDays?: number[]; // 0-6 (domingo-sábado)
  validHours?: {
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  };
}

export interface ProductFilters {
  category?: string;
  available?: boolean;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: File;
  available: boolean;
  additionals: Omit<ProductAdditional, "id">[];
  removals: Omit<ProductRemoval, "id">[];
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
  tags?: string[];
}
