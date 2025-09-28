/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly NODE_ENV: "development" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Tipos do Electron
interface ElectronAPI {
  getWorkspaces: () => Promise<any[]>;
  openWorkspace: (workspaceId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<any>;
  getAppVersion: () => Promise<string>;
  onOrderStatusUpdated: (callback: (data: any) => void) => void;
  onWindowFocus: (callback: (isFocused: boolean) => void) => void;
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
