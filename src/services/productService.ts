import api from "./api";
import type {
  Product,
  ProductCategory,
  ProductCombo,
  ProductPromotion,
  ProductFilters,
} from "../types/product";
import type { PaginatedResponse } from "../types/api";

class ProductService {
  // Products
  async getProducts(
    workspaceId: string,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    params.append("workspaceId", workspaceId);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  }

  async createProduct(data: FormData): Promise<Product> {
    const response = await api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }

  async updateProduct(id: string, data: FormData): Promise<Product> {
    const response = await api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  async toggleProductAvailability(id: string): Promise<Product> {
    const response = await api.patch(`/products/${id}/toggle-availability`);
    return response.data.data;
  }

  async duplicateProduct(id: string): Promise<Product> {
    const response = await api.post(`/products/${id}/duplicate`);
    return response.data.data;
  }

  async bulkUpdateProducts(
    ids: string[],
    updates: Partial<Product>
  ): Promise<Product[]> {
    const response = await api.patch("/products/bulk-update", { ids, updates });
    return response.data.data;
  }

  async importProducts(
    file: File,
    workspaceId: string
  ): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", workspaceId);

    const response = await api.post("/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }

  async exportProducts(
    workspaceId: string,
    format: "csv" | "xlsx" = "xlsx"
  ): Promise<Blob> {
    const response = await api.get(`/products/export`, {
      params: { workspaceId, format },
      responseType: "blob",
    });
    return response.data;
  }

  // Categories
  async getCategories(workspaceId: string): Promise<ProductCategory[]> {
    const response = await api.get(`/categories?workspaceId=${workspaceId}`);
    return response.data.data;
  }

  async createCategory(
    data: Omit<ProductCategory, "id" | "createdAt" | "updatedAt">
  ): Promise<ProductCategory> {
    const response = await api.post("/categories", data);
    return response.data.data;
  }

  async updateCategory(
    id: string,
    data: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }

  async reorderCategories(
    workspaceId: string,
    categoryIds: string[]
  ): Promise<void> {
    await api.post("/categories/reorder", { workspaceId, categoryIds });
  }

  // Combos
  async getCombos(workspaceId: string): Promise<ProductCombo[]> {
    const response = await api.get(`/combos?workspaceId=${workspaceId}`);
    return response.data.data;
  }

  async getComboById(id: string): Promise<ProductCombo> {
    const response = await api.get(`/combos/${id}`);
    return response.data.data;
  }

  async createCombo(
    data: Omit<ProductCombo, "id" | "createdAt" | "updatedAt">
  ): Promise<ProductCombo> {
    const response = await api.post("/combos", data);
    return response.data.data;
  }

  async updateCombo(
    id: string,
    data: Partial<ProductCombo>
  ): Promise<ProductCombo> {
    const response = await api.put(`/combos/${id}`, data);
    return response.data.data;
  }

  async deleteCombo(id: string): Promise<void> {
    await api.delete(`/combos/${id}`);
  }

  async toggleComboAvailability(id: string): Promise<ProductCombo> {
    const response = await api.patch(`/combos/${id}/toggle-availability`);
    return response.data.data;
  }

  // Promotions
  async getPromotions(workspaceId: string): Promise<ProductPromotion[]> {
    const response = await api.get(`/promotions?workspaceId=${workspaceId}`);
    return response.data.data;
  }

  async getPromotionById(id: string): Promise<ProductPromotion> {
    const response = await api.get(`/promotions/${id}`);
    return response.data.data;
  }

  async createPromotion(
    data: Omit<
      ProductPromotion,
      "id" | "createdAt" | "updatedAt" | "currentUses"
    >
  ): Promise<ProductPromotion> {
    const response = await api.post("/promotions", data);
    return response.data.data;
  }

  async updatePromotion(
    id: string,
    data: Partial<ProductPromotion>
  ): Promise<ProductPromotion> {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data.data;
  }

  async deletePromotion(id: string): Promise<void> {
    await api.delete(`/promotions/${id}`);
  }

  async togglePromotionStatus(id: string): Promise<ProductPromotion> {
    const response = await api.patch(`/promotions/${id}/toggle-status`);
    return response.data.data;
  }

  async getActivePromotions(workspaceId: string): Promise<ProductPromotion[]> {
    const response = await api.get(
      `/promotions/active?workspaceId=${workspaceId}`
    );
    return response.data.data;
  }

  async validatePromotion(
    promotionId: string,
    orderData: any
  ): Promise<{ valid: boolean; discount: number; reason?: string }> {
    const response = await api.post(
      `/promotions/${promotionId}/validate`,
      orderData
    );
    return response.data.data;
  }

  // Analytics
  async getProductAnalytics(
    workspaceId: string,
    period: "7d" | "30d" | "90d" = "30d"
  ): Promise<{
    topProducts: Array<{ product: Product; sales: number; revenue: number }>;
    categoryPerformance: Array<{
      category: ProductCategory;
      sales: number;
      revenue: number;
    }>;
    salesTrends: Array<{ date: string; sales: number; revenue: number }>;
  }> {
    const response = await api.get(`/products/analytics`, {
      params: { workspaceId, period },
    });
    return response.data.data;
  }

  async getLowStockProducts(workspaceId: string): Promise<Product[]> {
    const response = await api.get(
      `/products/low-stock?workspaceId=${workspaceId}`
    );
    return response.data.data;
  }

  // Batch operations
  async batchDelete(productIds: string[]): Promise<void> {
    await api.post("/products/batch-delete", { productIds });
  }

  async batchUpdateAvailability(
    productIds: string[],
    available: boolean
  ): Promise<void> {
    await api.post("/products/batch-availability", { productIds, available });
  }

  async batchUpdateCategory(
    productIds: string[],
    categoryId: string
  ): Promise<void> {
    await api.post("/products/batch-category", { productIds, categoryId });
  }

  async batchUpdatePrices(
    updates: Array<{ id: string; price: number }>
  ): Promise<void> {
    await api.post("/products/batch-prices", { updates });
  }
}

export default new ProductService();
