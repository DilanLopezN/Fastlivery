// Tipos globais para Electron API

interface ElectronAPI {
  // Workspaces
  getWorkspaces: () => Promise<any[]>;
  openWorkspace: (workspaceId: string) => Promise<void>;

  // Orders
  updateOrderStatus: (orderId: string, status: string) => Promise<any>;

  // Products - CRUD
  getProducts: (
    workspaceId: string,
    filters?: any
  ) => Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  saveProduct: (productData: any) => Promise<{ success: boolean; id: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean }>;

  // Product Images
  uploadProductImage: (
    imageData: string | ArrayBuffer,
    fileName: string
  ) => Promise<string>;
  deleteProductImage: (imagePath: string) => Promise<boolean>;

  // Combos
  getCombos: (workspaceId: string) => Promise<any[]>;
  saveCombo: (comboData: any) => Promise<{ success: boolean; id: string }>;
  deleteCombo: (comboId: string) => Promise<{ success: boolean }>;

  // Categories
  getCategories: (workspaceId: string) => Promise<any[]>;
  saveCategory: (
    categoryData: any
  ) => Promise<{ success: boolean; id: string }>;
  deleteCategory: (categoryId: string) => Promise<{ success: boolean }>;

  // Import/Export
  readImportFile: (filePath: string) => Promise<string>;
  writeExportFile: (
    filePath: string,
    data: string
  ) => Promise<{ success: boolean }>;

  // App
  getAppVersion: () => Promise<string>;

  // Event listeners
  onOrderStatusUpdated: (callback: (data: any) => void) => void;
  onWindowFocus: (callback: (isFocused: boolean) => void) => void;
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;

  // Menu events
  onMenuNewProduct: (callback: () => void) => void;
  onMenuNewCombo: (callback: () => void) => void;
  onMenuManageCategories: (callback: () => void) => void;

  // Import/Export events
  onImportProducts: (callback: (filePath: string) => void) => void;
  onExportProducts: (callback: (filePath: string) => void) => void;

  // Utilities
  removeAllListeners: (channel: string) => void;
  showItemInFolder: (filePath: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;

  // File operations
  selectImageFile: () => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
  selectImportFile: () => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
  selectExportPath: (defaultName: string) => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;
}

// Declaração global para Window
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
