/// <reference path="../types/global.d.ts" />

import type {
  Product,
  ProductCategory,
  ProductCombo,
  ProductFilters,
} from "../types/product";
import type { PaginatedResponse } from "../types/api";

/**
 * Service adaptador para usar Electron API em vez de HTTP requests
 * Útil quando a aplicação está rodando como desktop app
 */
class ElectronProductService {
  private get isElectron(): boolean {
    return !!window.electronAPI;
  }

  private ensureElectron(): void {
    if (!this.isElectron) {
      throw new Error("Electron API não está disponível");
    }
  }

  // Products
  async getProducts(
    workspaceId: string,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    this.ensureElectron();

    try {
      const response = await window.electronAPI!.getProducts(
        workspaceId,
        filters
      );
      return {
        data: response.data.map(this.transformProduct),
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    } catch (error) {
      console.error("Erro ao buscar produtos via Electron:", error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    this.ensureElectron();

    // Como não temos um endpoint específico, vamos simular
    // Em uma implementação real, você adicionaria este IPC handler
    throw new Error("getProductById não implementado para Electron");
  }

  async createProduct(data: FormData | any): Promise<Product> {
    this.ensureElectron();

    try {
      // Converter FormData para objeto se necessário
      let productData = data;
      if (data instanceof FormData) {
        productData = this.formDataToObject(data);
      }

      // Upload de imagem se necessário
      if (productData.image && productData.image instanceof File) {
        const imagePath = await this.uploadImage(productData.image);
        productData.image = imagePath;
      }

      const result = await window.electronAPI!.saveProduct(productData);

      if (result.success) {
        return {
          ...productData,
          id: result.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Product;
      } else {
        throw new Error("Falha ao criar produto");
      }
    } catch (error) {
      console.error("Erro ao criar produto via Electron:", error);
      throw error;
    }
  }

  async updateProduct(id: string, data: FormData | any): Promise<Product> {
    this.ensureElectron();

    try {
      let productData = data;
      if (data instanceof FormData) {
        productData = this.formDataToObject(data);
      }

      // Upload de nova imagem se necessário
      if (productData.image && productData.image instanceof File) {
        const imagePath = await this.uploadImage(productData.image);
        productData.image = imagePath;
      }

      const result = await window.electronAPI!.saveProduct({
        ...productData,
        id,
      });

      if (result.success) {
        return {
          ...productData,
          id,
          updatedAt: new Date(),
        } as Product;
      } else {
        throw new Error("Falha ao atualizar produto");
      }
    } catch (error) {
      console.error("Erro ao atualizar produto via Electron:", error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.deleteProduct(id);
      if (!result.success) {
        throw new Error("Falha ao deletar produto");
      }
    } catch (error) {
      console.error("Erro ao deletar produto via Electron:", error);
      throw error;
    }
  }

  async toggleProductAvailability(id: string): Promise<Product> {
    // Para simplicidade, vamos simular que o toggle é feito no lado do Electron
    // Em uma implementação real, você adicionaria um IPC handler específico
    throw new Error("toggleProductAvailability não implementado para Electron");
  }

  // Categories
  async getCategories(workspaceId: string): Promise<ProductCategory[]> {
    this.ensureElectron();

    try {
      const categories = await window.electronAPI!.getCategories(workspaceId);
      return categories.map(this.transformCategory);
    } catch (error) {
      console.error("Erro ao buscar categorias via Electron:", error);
      throw error;
    }
  }

  async createCategory(
    data: Omit<ProductCategory, "id" | "createdAt" | "updatedAt">
  ): Promise<ProductCategory> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.saveCategory(data);
      if (result.success) {
        return {
          ...data,
          id: result.id,
        } as ProductCategory;
      } else {
        throw new Error("Falha ao criar categoria");
      }
    } catch (error) {
      console.error("Erro ao criar categoria via Electron:", error);
      throw error;
    }
  }

  async updateCategory(
    id: string,
    data: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.saveCategory({
        ...data,
        id,
      });

      if (result.success) {
        return {
          ...data,
          id,
        } as ProductCategory;
      } else {
        throw new Error("Falha ao atualizar categoria");
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria via Electron:", error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.deleteCategory(id);
      if (!result.success) {
        throw new Error("Falha ao deletar categoria");
      }
    } catch (error) {
      console.error("Erro ao deletar categoria via Electron:", error);
      throw error;
    }
  }

  // Combos
  async getCombos(workspaceId: string): Promise<ProductCombo[]> {
    this.ensureElectron();

    try {
      const combos = await window.electronAPI!.getCombos(workspaceId);
      return combos.map(this.transformCombo);
    } catch (error) {
      console.error("Erro ao buscar combos via Electron:", error);
      throw error;
    }
  }

  async createCombo(
    data: Omit<ProductCombo, "id" | "createdAt" | "updatedAt">
  ): Promise<ProductCombo> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.saveCombo(data);
      if (result.success) {
        return {
          ...data,
          id: result.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ProductCombo;
      } else {
        throw new Error("Falha ao criar combo");
      }
    } catch (error) {
      console.error("Erro ao criar combo via Electron:", error);
      throw error;
    }
  }

  async updateCombo(
    id: string,
    data: Partial<ProductCombo>
  ): Promise<ProductCombo> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.saveCombo({
        ...data,
        id,
      });

      if (result.success) {
        return {
          ...data,
          id,
          updatedAt: new Date(),
        } as ProductCombo;
      } else {
        throw new Error("Falha ao atualizar combo");
      }
    } catch (error) {
      console.error("Erro ao atualizar combo via Electron:", error);
      throw error;
    }
  }

  async deleteCombo(id: string): Promise<void> {
    this.ensureElectron();

    try {
      const result = await window.electronAPI!.deleteCombo(id);
      if (!result.success) {
        throw new Error("Falha ao deletar combo");
      }
    } catch (error) {
      console.error("Erro ao deletar combo via Electron:", error);
      throw error;
    }
  }

  // Utility methods
  private formDataToObject(formData: FormData): any {
    const obj: any = {};

    for (const [key, value] of formData.entries()) {
      if (key.includes("[]")) {
        // Handle arrays
        const arrayKey = key.replace("[]", "");
        if (!obj[arrayKey]) obj[arrayKey] = [];
        obj[arrayKey].push(value);
      } else if (key.includes(".")) {
        // Handle nested objects (like additionals.0.name)
        const keys = key.split(".");
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!current[k]) {
            current[k] = isNaN(Number(keys[i + 1])) ? {} : [];
          }
          current = current[k];
        }

        current[keys[keys.length - 1]] = value;
      } else {
        obj[key] = value;
      }
    }

    return obj;
  }

  private async uploadImage(file: File): Promise<string> {
    this.ensureElectron();

    try {
      // Converter File para base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode(...uint8Array));
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Upload via Electron
      const imagePath = await window.electronAPI!.uploadProductImage(
        dataUrl,
        file.name
      );
      return imagePath;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }
  }

  private transformProduct(data: any): Product {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      additionals: data.additionals || [],
      removals: data.removals || [],
      allergens: data.allergens || [],
      tags: data.tags || [],
    };
  }

  private transformCategory(data: any): ProductCategory {
    return {
      ...data,
      active: data.active !== false, // Default to true if not specified
    };
  }

  private transformCombo(data: any): ProductCombo {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      items: data.items || [],
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    };
  }

  // Import/Export helpers
  async importFromFile(filePath: string): Promise<any[]> {
    this.ensureElectron();

    try {
      const fileContent = await window.electronAPI!.readImportFile(filePath);

      // Parse based on file extension
      const ext = filePath.split(".").pop()?.toLowerCase();

      if (ext === "csv") {
        return this.parseCSV(fileContent);
      } else {
        throw new Error(`Formato de arquivo não suportado: ${ext}`);
      }
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      throw error;
    }
  }

  async exportToFile(data: any[], filePath: string): Promise<void> {
    this.ensureElectron();

    try {
      const ext = filePath.split(".").pop()?.toLowerCase();

      let content: string;
      if (ext === "csv") {
        content = this.generateCSV(data);
      } else {
        throw new Error(`Formato de arquivo não suportado: ${ext}`);
      }

      await window.electronAPI!.writeExportFile(filePath, content);
    } catch (error) {
      console.error("Erro ao exportar arquivo:", error);
      throw error;
    }
  }

  private parseCSV(csvContent: string): any[] {
    const lines = csvContent.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length === headers.length && values[0]) {
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = values[index];
        });
        data.push(item);
      }
    }

    return data;
  }

  private generateCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers.map((header) => `"${item[header] || ""}"`).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }
}

export default new ElectronProductService();
