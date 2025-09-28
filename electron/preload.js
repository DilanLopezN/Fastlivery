import { contextBridge, ipcRenderer } from "electron";

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Workspaces
  getWorkspaces: () => ipcRenderer.invoke("get-workspaces"),
  openWorkspace: (workspaceId) =>
    ipcRenderer.invoke("open-workspace", workspaceId),

  // Orders (funcionalidade existente)
  updateOrderStatus: (orderId, status) =>
    ipcRenderer.invoke("update-order-status", orderId, status),

  // Products - CRUD
  getProducts: (workspaceId, filters) =>
    ipcRenderer.invoke("get-products", workspaceId, filters),
  saveProduct: (productData) => ipcRenderer.invoke("save-product", productData),
  deleteProduct: (productId) => ipcRenderer.invoke("delete-product", productId),

  // Product Images
  uploadProductImage: (imageData, fileName) =>
    ipcRenderer.invoke("upload-product-image", imageData, fileName),
  deleteProductImage: (imagePath) =>
    ipcRenderer.invoke("delete-product-image", imagePath),

  // Combos
  getCombos: (workspaceId) => ipcRenderer.invoke("get-combos", workspaceId),
  saveCombo: (comboData) => ipcRenderer.invoke("save-combo", comboData),
  deleteCombo: (comboId) => ipcRenderer.invoke("delete-combo", comboId),

  // Categories
  getCategories: (workspaceId) =>
    ipcRenderer.invoke("get-categories", workspaceId),
  saveCategory: (categoryData) =>
    ipcRenderer.invoke("save-category", categoryData),
  deleteCategory: (categoryId) =>
    ipcRenderer.invoke("delete-category", categoryId),

  // Import/Export
  readImportFile: (filePath) =>
    ipcRenderer.invoke("read-import-file", filePath),
  writeExportFile: (filePath, data) =>
    ipcRenderer.invoke("write-export-file", filePath, data),

  // App
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Event listeners
  onOrderStatusUpdated: (callback) => {
    ipcRenderer.on("order-status-updated", (event, data) => callback(data));
  },

  onWindowFocus: (callback) => {
    ipcRenderer.on("window-focus", (event, isFocused) => callback(isFocused));
  },

  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", () => callback());
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", () => callback());
  },

  // Menu events para produtos
  onMenuNewProduct: (callback) => {
    ipcRenderer.on("menu-new-product", () => callback());
  },

  onMenuNewCombo: (callback) => {
    ipcRenderer.on("menu-new-combo", () => callback());
  },

  onMenuManageCategories: (callback) => {
    ipcRenderer.on("menu-manage-categories", () => callback());
  },

  // Import/Export events
  onImportProducts: (callback) => {
    ipcRenderer.on("import-products", (event, filePath) => callback(filePath));
  },

  onExportProducts: (callback) => {
    ipcRenderer.on("export-products", (event, filePath) => callback(filePath));
  },

  // Remover listeners (importante para cleanup)
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Utilities
  showItemInFolder: (filePath) => {
    ipcRenderer.invoke("show-item-in-folder", filePath);
  },

  openExternal: (url) => {
    ipcRenderer.invoke("open-external", url);
  },

  // File operations
  selectImageFile: () => {
    return ipcRenderer.invoke("select-image-file");
  },

  selectImportFile: () => {
    return ipcRenderer.invoke("select-import-file");
  },

  selectExportPath: (defaultName) => {
    return ipcRenderer.invoke("select-export-path", defaultName);
  },
});
