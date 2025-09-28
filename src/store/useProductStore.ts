import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Product,
  ProductCategory,
  ProductCombo,
  ProductPromotion,
  ProductFilters,
  ProductFormData,
} from "../types/product";
import api from "../services/api";

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  combos: ProductCombo[];
  promotions: ProductPromotion[];
  isLoading: boolean;
  filters: ProductFilters;

  // Actions
  fetchProducts: (
    workspaceId: string,
    filters?: ProductFilters
  ) => Promise<void>;
  fetchCategories: (workspaceId: string) => Promise<void>;
  fetchCombos: (workspaceId: string) => Promise<void>;
  fetchPromotions: (workspaceId: string) => Promise<void>;

  // Product CRUD
  createProduct: (data: ProductFormData) => Promise<Product>;
  updateProduct: (
    id: string,
    data: Partial<ProductFormData>
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailability: (id: string) => Promise<void>;

  // Category CRUD
  createCategory: (
    data: Omit<ProductCategory, "id" | "createdAt" | "updatedAt">
  ) => Promise<ProductCategory>;
  updateCategory: (
    id: string,
    data: Partial<ProductCategory>
  ) => Promise<ProductCategory>;
  deleteCategory: (id: string) => Promise<void>;

  // Combo CRUD
  createCombo: (
    data: Omit<ProductCombo, "id" | "createdAt" | "updatedAt">
  ) => Promise<ProductCombo>;
  updateCombo: (
    id: string,
    data: Partial<ProductCombo>
  ) => Promise<ProductCombo>;
  deleteCombo: (id: string) => Promise<void>;

  // Promotion CRUD
  createPromotion: (
    data: Omit<
      ProductPromotion,
      "id" | "createdAt" | "updatedAt" | "currentUses"
    >
  ) => Promise<ProductPromotion>;
  updatePromotion: (
    id: string,
    data: Partial<ProductPromotion>
  ) => Promise<ProductPromotion>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotionStatus: (id: string) => Promise<void>;

  // Filters
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;

  // Utils
  getProductsByCategory: (categoryId: string) => Product[];
  getAvailableProducts: () => Product[];
  getActivePromotions: () => ProductPromotion[];
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      combos: [],
      promotions: [],
      isLoading: false,
      filters: {},

      fetchProducts: async (workspaceId: string, filters?: ProductFilters) => {
        set({ isLoading: true });
        try {
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
          set({
            products: response.data.data,
            isLoading: false,
            filters: filters || {},
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchCategories: async (workspaceId: string) => {
        try {
          const response = await api.get(
            `/categories?workspaceId=${workspaceId}`
          );
          set({ categories: response.data.data });
        } catch (error) {
          throw error;
        }
      },

      fetchCombos: async (workspaceId: string) => {
        try {
          const response = await api.get(`/combos?workspaceId=${workspaceId}`);
          set({ combos: response.data.data });
        } catch (error) {
          throw error;
        }
      },

      fetchPromotions: async (workspaceId: string) => {
        try {
          const response = await api.get(
            `/promotions?workspaceId=${workspaceId}`
          );
          set({ promotions: response.data.data });
        } catch (error) {
          throw error;
        }
      },

      createProduct: async (data: ProductFormData) => {
        const formData = new FormData();

        // Adicionar campos básicos
        Object.entries(data).forEach(([key, value]) => {
          if (key === "image" && value) {
            if (value instanceof File) {
              formData.append("image", value);
            }
          } else if (
            key === "additionals" ||
            key === "removals" ||
            key === "allergens" ||
            key === "tags"
          ) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        const response = await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const newProduct = response.data.data;
        set((state) => ({
          products: [...state.products, newProduct],
        }));

        return newProduct;
      },

      updateProduct: async (id: string, data: Partial<ProductFormData>) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (key === "image" && value) {
            if (value instanceof File || value instanceof Blob) {
              formData.append("image", value);
            }
          } else if (
            key === "additionals" ||
            key === "removals" ||
            key === "allergens" ||
            key === "tags"
          ) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        const response = await api.put(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const updatedProduct = response.data.data;
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? updatedProduct : p
          ),
        }));

        return updatedProduct;
      },

      deleteProduct: async (id: string) => {
        await api.delete(`/products/${id}`);
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      toggleProductAvailability: async (id: string) => {
        const response = await api.patch(`/products/${id}/toggle-availability`);
        const updatedProduct = response.data.data;

        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? updatedProduct : p
          ),
        }));
      },

      createCategory: async (data) => {
        const response = await api.post("/categories", data);
        const newCategory = response.data.data;

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));

        return newCategory;
      },

      updateCategory: async (id: string, data) => {
        const response = await api.put(`/categories/${id}`, data);
        const updatedCategory = response.data.data;

        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? updatedCategory : c
          ),
        }));

        return updatedCategory;
      },

      deleteCategory: async (id: string) => {
        await api.delete(`/categories/${id}`);
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      createCombo: async (data) => {
        const response = await api.post("/combos", data);
        const newCombo = response.data.data;

        set((state) => ({
          combos: [...state.combos, newCombo],
        }));

        return newCombo;
      },

      updateCombo: async (id: string, data) => {
        const response = await api.put(`/combos/${id}`, data);
        const updatedCombo = response.data.data;

        set((state) => ({
          combos: state.combos.map((c) => (c.id === id ? updatedCombo : c)),
        }));

        return updatedCombo;
      },

      deleteCombo: async (id: string) => {
        await api.delete(`/combos/${id}`);
        set((state) => ({
          combos: state.combos.filter((c) => c.id !== id),
        }));
      },

      createPromotion: async (data) => {
        const response = await api.post("/promotions", data);
        const newPromotion = response.data.data;

        set((state) => ({
          promotions: [...state.promotions, newPromotion],
        }));

        return newPromotion;
      },

      updatePromotion: async (id: string, data) => {
        const response = await api.put(`/promotions/${id}`, data);
        const updatedPromotion = response.data.data;

        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.id === id ? updatedPromotion : p
          ),
        }));

        return updatedPromotion;
      },

      deletePromotion: async (id: string) => {
        await api.delete(`/promotions/${id}`);
        set((state) => ({
          promotions: state.promotions.filter((p) => p.id !== id),
        }));
      },

      togglePromotionStatus: async (id: string) => {
        const response = await api.patch(`/promotions/${id}/toggle-status`);
        const updatedPromotion = response.data.data;

        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.id === id ? updatedPromotion : p
          ),
        }));
      },

      setFilters: (filters: Partial<ProductFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      getProductsByCategory: (categoryId: string) => {
        return get().products.filter((p) => p.category === categoryId);
      },

      getAvailableProducts: () => {
        return get().products.filter((p) => p.available);
      },

      getActivePromotions: () => {
        const now = new Date();
        return get().promotions.filter(
          (p) =>
            p.active &&
            new Date(p.startDate) <= now &&
            new Date(p.endDate) >= now
        );
      },
    }),
    {
      name: "product-storage",
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
