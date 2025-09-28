import { useEffect, useState, useCallback } from "react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useProductStore } from "../store/useProductStore";
import toast from "react-hot-toast";

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  const { currentWorkspace } = useWorkspaceStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    // Detectar se está rodando no Electron
    setIsElectron(!!window.electronAPI);

    if (window.electronAPI) {
      // Event listeners para menu
      const handleNewProduct = () => {
        setProductModalOpen(true);
      };

      const handleNewCombo = () => {
        setComboModalOpen(true);
      };

      const handleManageCategories = () => {
        setCategoriesModalOpen(true);
        // Ou redirecionar para tab de categorias
        // window.location.hash = "#categories";
      };

      const handleImportProducts = (filePath: string) => {
        importProductsFromFile(filePath);
      };

      const handleExportProducts = (filePath: string) => {
        exportProductsToFile(filePath);
      };

      window.electronAPI.onMenuNewProduct(handleNewProduct);
      window.electronAPI.onMenuNewCombo(handleNewCombo);
      window.electronAPI.onMenuManageCategories(handleManageCategories);
      window.electronAPI.onImportProducts(handleImportProducts);
      window.electronAPI.onExportProducts(handleExportProducts);

      // Cleanup function
      return () => {
        window.electronAPI?.removeAllListeners("menu-new-product");
        window.electronAPI?.removeAllListeners("menu-new-combo");
        window.electronAPI?.removeAllListeners("menu-manage-categories");
        window.electronAPI?.removeAllListeners("import-products");
        window.electronAPI?.removeAllListeners("export-products");
      };
    }
  }, []);

  const importProductsFromFile = useCallback(
    async (filePath: string) => {
      if (!window.electronAPI || !currentWorkspace) return;

      const loadingToast = toast.loading("Importando produtos...");

      try {
        // Ler arquivo
        const fileContent = await window.electronAPI.readImportFile(filePath);

        // Processar dados baseado na extensão
        const ext = filePath.split(".").pop()?.toLowerCase();
        let products = [];

        if (ext === "csv") {
          products = parseCSV(fileContent);
        } else if (ext === "xlsx" || ext === "xls") {
          // Para Excel, você precisaria de uma biblioteca como xlsx
          toast.dismiss(loadingToast);
          toast.error("Importação de Excel ainda não implementada");
          return;
        } else {
          toast.dismiss(loadingToast);
          toast.error("Formato de arquivo não suportado");
          return;
        }

        // Salvar produtos
        let successCount = 0;
        let errorCount = 0;

        for (const product of products) {
          try {
            await window.electronAPI.saveProduct({
              ...product,
              workspaceId: currentWorkspace.id,
            });
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Erro ao importar produto ${product.name}:`, error);
          }
        }

        toast.dismiss(loadingToast);

        if (successCount > 0) {
          toast.success(`${successCount} produtos importados com sucesso!`);
          // Recarregar produtos
          fetchProducts(currentWorkspace.id);
        }

        if (errorCount > 0) {
          toast.error(`${errorCount} produtos falharam na importação`);
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Erro ao importar produtos");
        console.error("Erro na importação:", error);
      }
    },
    [currentWorkspace, fetchProducts]
  );

  const exportProductsToFile = useCallback(
    async (filePath: string) => {
      if (!window.electronAPI || !currentWorkspace) return;

      const loadingToast = toast.loading("Exportando produtos...");

      try {
        // Buscar produtos do workspace atual
        const response = await window.electronAPI.getProducts(
          currentWorkspace.id
        );
        const products = response.data;

        if (products.length === 0) {
          toast.dismiss(loadingToast);
          toast.error("Nenhum produto para exportar");
          return;
        }

        // Converter para CSV
        const csvContent = generateCSV(products);

        // Salvar arquivo
        await window.electronAPI.writeExportFile(filePath, csvContent);

        toast.dismiss(loadingToast);
        toast.success(`${products.length} produtos exportados com sucesso!`);
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Erro ao exportar produtos");
        console.error("Erro na exportação:", error);
      }
    },
    [currentWorkspace]
  );

  const parseCSV = (csvContent: string) => {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      // Parse CSV considerando valores entre aspas
      const values: any = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];

        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Adicionar último valor

      if (values.length === headers.length) {
        const product: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.replace(/^["']|["']$/g, "").trim();

          // Mapear campos CSV para campos do produto
          switch (header.toLowerCase()) {
            case "nome":
            case "name":
              product.name = value;
              break;
            case "descrição":
            case "descricao":
            case "description":
              product.description = value;
              break;
            case "preço":
            case "preco":
            case "price":
              product.price = parseFloat(value.replace(",", ".")) || 0;
              break;
            case "categoria":
            case "category":
              product.category = value;
              break;
            case "disponível":
            case "disponivel":
            case "available":
              product.available =
                value.toLowerCase() === "true" ||
                value.toLowerCase() === "sim" ||
                value === "1";
              break;
            case "tempo_preparo":
            case "preparation_time":
              product.preparationTime = parseInt(value) || 0;
              break;
            case "calorias":
            case "calories":
              product.calories = parseInt(value) || 0;
              break;
            case "tags":
              product.tags = value
                ? value.split("|").map((t: any) => t.trim())
                : [];
              break;
            case "alérgenos":
            case "alergenos":
            case "allergens":
              product.allergens = value
                ? value.split("|").map((a: any) => a.trim())
                : [];
              break;
          }
        });

        if (product.name && product.price !== undefined) {
          products.push(product);
        }
      }
    }

    return products;
  };

  const generateCSV = (products: any[]) => {
    const headers = [
      "nome",
      "descrição",
      "preço",
      "categoria",
      "disponível",
      "tempo_preparo",
      "calorias",
      "tags",
      "alérgenos",
    ];

    const rows = products.map((product) => [
      product.name || "",
      product.description || "",
      product.price || 0,
      product.category || "",
      product.available ? "sim" : "não",
      product.preparationTime || 0,
      product.calories || 0,
      (product.tags || []).join("|"),
      (product.allergens || []).join("|"),
    ]);

    // Adicionar aspas para lidar com vírgulas nos valores
    const csvRows = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    );

    return csvRows.join("\n");
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!window.electronAPI) {
      throw new Error("Electron API não disponível");
    }

    try {
      // Converter File para base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
          try {
            const dataUrl = reader.result as string;
            const imagePath = await window.electronAPI!.uploadProductImage(
              dataUrl,
              file.name
            );
            resolve(imagePath);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error("Erro ao ler arquivo"));
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }
  };

  const deleteImage = async (imagePath: string): Promise<boolean> => {
    if (!window.electronAPI) {
      return false;
    }

    try {
      return await window.electronAPI.deleteProductImage(imagePath);
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      return false;
    }
  };

  const selectImageFile = async (): Promise<File | null> => {
    if (!window.electronAPI) {
      return null;
    }

    try {
      const result = await window.electronAPI.selectImageFile();
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        // Em uma aplicação Electron real, você precisaria implementar
        // uma forma de converter o path em File object
        // Por enquanto, retornamos null como placeholder
        console.log("Arquivo selecionado:", filePath);
        return null;
      }
      return null;
    } catch (error) {
      console.error("Erro ao selecionar arquivo:", error);
      return null;
    }
  };

  const openExternalLink = async (url: string) => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const showInFolder = async (filePath: string) => {
    if (window.electronAPI) {
      await window.electronAPI.showItemInFolder(filePath);
    }
  };

  return {
    isElectron,
    uploadImage,
    deleteImage,
    selectImageFile,
    openExternalLink,
    showInFolder,
    importProductsFromFile,
    exportProductsToFile,
    // Estados dos modais
    productModalOpen,
    setProductModalOpen,
    comboModalOpen,
    setComboModalOpen,
    categoriesModalOpen,
    setCategoriesModalOpen,
  };
};

// Hook específico para integração com ProductStore
export const useElectronProductStore = () => {
  const { isElectron, uploadImage } = useElectron();
  const { currentWorkspace } = useWorkspaceStore();

  const createProductWithElectron = async (productData: any) => {
    if (!window.electronAPI) {
      throw new Error("Electron API não disponível");
    }

    if (!currentWorkspace) {
      throw new Error("Workspace não selecionado");
    }

    try {
      // Se há imagem, fazer upload primeiro
      if (productData.image && productData.image instanceof File) {
        const imagePath = await uploadImage(productData.image);
        productData.image = imagePath;
      }

      // Adicionar workspaceId
      productData.workspaceId = currentWorkspace.id;

      // Salvar produto via Electron
      const result = await window.electronAPI.saveProduct(productData);

      if (!result.success) {
        throw new Error("Falha ao salvar produto");
      }

      return result;
    } catch (error) {
      console.error("Erro ao criar produto via Electron:", error);
      throw error;
    }
  };

  const updateProductWithElectron = async (
    productId: string,
    productData: any
  ) => {
    if (!window.electronAPI) {
      throw new Error("Electron API não disponível");
    }

    try {
      // Se há nova imagem, fazer upload
      if (productData.image && productData.image instanceof File) {
        const imagePath = await uploadImage(productData.image);
        productData.image = imagePath;
      }

      // Atualizar produto via Electron
      const result = await window.electronAPI.saveProduct({
        ...productData,
        id: productId,
      });

      if (!result.success) {
        throw new Error("Falha ao atualizar produto");
      }

      return result;
    } catch (error) {
      console.error("Erro ao atualizar produto via Electron:", error);
      throw error;
    }
  };

  const deleteProductWithElectron = async (productId: string) => {
    if (!window.electronAPI) {
      throw new Error("Electron API não disponível");
    }

    try {
      const result = await window.electronAPI.deleteProduct(productId);

      if (!result.success) {
        throw new Error("Falha ao deletar produto");
      }

      return result;
    } catch (error) {
      console.error("Erro ao deletar produto via Electron:", error);
      throw error;
    }
  };

  return {
    isElectron,
    createProductWithElectron,
    updateProductWithElectron,
    deleteProductWithElectron,
  };
};
