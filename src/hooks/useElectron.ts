import { useEffect, useState } from "react";
import { useProductStore } from "../store/useProductStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import toast from "react-hot-toast";

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const { setProductModalOpen, setComboModalOpen } = useProductStore();
  const { currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    // Detectar se está rodando no Electron
    setIsElectron(!!window.electronAPI);

    if (window.electronAPI) {
      // Event listeners para menu
      window.electronAPI.onMenuNewProduct(() => {
        setProductModalOpen(true);
      });

      window.electronAPI.onMenuNewCombo(() => {
        setComboModalOpen(true);
      });

      window.electronAPI.onMenuManageCategories(() => {
        // Redirecionar para tab de categorias
        window.location.hash = "#categories";
        // Ou usar navigate se estiver usando React Router
        // navigate("/products?tab=categories");
      });

      // Event listeners para import/export
      window.electronAPI.onImportProducts((filePath: string) => {
        handleImportProducts(filePath);
      });

      window.electronAPI.onExportProducts((filePath: string) => {
        handleExportProducts(filePath);
      });

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

  const handleImportProducts = async (filePath: string) => {
    if (!window.electronAPI || !currentWorkspace) return;

    try {
      toast.loading("Importando produtos...");

      // Ler arquivo
      const fileContent = await window.electronAPI.readImportFile(filePath);

      // Processar dados baseado na extensão
      const ext = filePath.split(".").pop()?.toLowerCase();
      let products = [];

      if (ext === "csv") {
        products = parseCSV(fileContent);
      } else if (ext === "xlsx" || ext === "xls") {
        // Para Excel, você precisaria de uma biblioteca como xlsx
        toast.error("Importação de Excel ainda não implementada");
        return;
      }

      // Salvar produtos
      for (const product of products) {
        await window.electronAPI.saveProduct({
          ...product,
          workspaceId: currentWorkspace.id,
        });
      }

      toast.dismiss();
      toast.success(`${products.length} produtos importados com sucesso!`);

      // Recarregar produtos
      // fetchProducts(currentWorkspace.id);
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao importar produtos");
      console.error("Erro na importação:", error);
    }
  };

  const handleExportProducts = async (filePath: string) => {
    if (!window.electronAPI || !currentWorkspace) return;

    try {
      toast.loading("Exportando produtos...");

      // Buscar produtos do workspace atual
      const response = await window.electronAPI.getProducts(
        currentWorkspace.id
      );
      const products = response.data;

      // Converter para CSV
      const csvContent = generateCSV(products);

      // Salvar arquivo
      await window.electronAPI.writeExportFile(filePath, csvContent);

      toast.dismiss();
      toast.success("Produtos exportados com sucesso!");
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao exportar produtos");
      console.error("Erro na exportação:", error);
    }
  };

  const parseCSV = (csvContent: string) => {
    const lines = csvContent.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length === headers.length) {
        const product: any = {};
        headers.forEach((header, index) => {
          const value = values[index]?.trim();

          // Mapear campos CSV para campos do produto
          switch (header.toLowerCase()) {
            case "nome":
            case "name":
              product.name = value;
              break;
            case "descrição":
            case "description":
              product.description = value;
              break;
            case "preço":
            case "price":
              product.price = parseFloat(value) || 0;
              break;
            case "categoria":
            case "category":
              product.category = value;
              break;
            case "disponível":
            case "available":
              product.available =
                value.toLowerCase() === "true" || value === "1";
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
              product.tags = value ? value.split("|").map((t) => t.trim()) : [];
              break;
            case "alérgenos":
            case "allergens":
              product.allergens = value
                ? value.split("|").map((a) => a.trim())
                : [];
              break;
          }
        });

        if (product.name && product.price) {
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
      product.available ? "true" : "false",
      product.preparationTime || 0,
      product.calories || 0,
      (product.tags || []).join("|"),
      (product.allergens || []).join("|"),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!window.electronAPI) {
      throw new Error("Electron API não disponível");
    }

    try {
      // Converter File para base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Upload via Electron
      const imagePath = await window.electronAPI.uploadProductImage(
        dataUrl,
        file.name
      );
      return imagePath;
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
        // Converter path para File object se necessário
        // Esta implementação depende de como você quer lidar com arquivos locais
        return null; // Placeholder
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
    handleImportProducts,
    handleExportProducts,
  };
};

// Hook específico para integração com ProductStore
export const useElectronProductStore = () => {
  const { isElectron, uploadImage } = useElectron();

  const createProductWithElectron = async (productData: any) => {
    if (!window.electronAPI) {
      throw new Error("Electron API não disponível");
    }

    try {
      // Se há imagem, fazer upload primeiro
      if (productData.image && productData.image instanceof File) {
        const imagePath = await uploadImage(productData.image);
        productData.image = imagePath;
      }

      // Salvar produto via Electron
      const result = await window.electronAPI.saveProduct(productData);
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
