import { app, BrowserWindow, Menu, ipcMain, shell, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";

let mainWindow;
let workspaceWindows = new Map();

// Configuração do menu da aplicação
const createMenu = () => {
  const template = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Novo Workspace",
          accelerator: "CmdOrCtrl+N",
          click: () => createWorkspaceWindow(),
        },
        {
          label: "Fechar Workspace",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) focusedWindow.close();
          },
        },
        { type: "separator" },
        {
          label: "Importar Produtos",
          accelerator: "CmdOrCtrl+I",
          click: () => importProducts(),
        },
        {
          label: "Exportar Produtos",
          accelerator: "CmdOrCtrl+E",
          click: () => exportProducts(),
        },
        { type: "separator" },
        {
          label: "Sair",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { label: "Desfazer", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Refazer", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Recortar", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Colar", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "Produtos",
      submenu: [
        {
          label: "Novo Produto",
          accelerator: "CmdOrCtrl+Shift+P",
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              focusedWindow.webContents.send("menu-new-product");
            }
          },
        },
        {
          label: "Novo Combo",
          accelerator: "CmdOrCtrl+Shift+C",
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              focusedWindow.webContents.send("menu-new-combo");
            }
          },
        },
        { type: "separator" },
        {
          label: "Gerenciar Categorias",
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              focusedWindow.webContents.send("menu-manage-categories");
            }
          },
        },
      ],
    },
    {
      label: "Visualizar",
      submenu: [
        { label: "Recarregar", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "Forçar Recarregamento",
          accelerator: "CmdOrCtrl+Shift+R",
          role: "forceReload",
        },
        { type: "separator" },
        { label: "Tela Cheia", accelerator: "F11", role: "togglefullscreen" },
        {
          label: "Ferramentas do Desenvolvedor",
          accelerator: "F12",
          role: "toggleDevTools",
        },
      ],
    },
    {
      label: "Janela",
      submenu: [
        { label: "Minimizar", accelerator: "CmdOrCtrl+M", role: "minimize" },
        { label: "Zoom", role: "zoom" },
        { type: "separator" },
        {
          label: "Trazer Todas para Frente",
          role: "front",
        },
      ],
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Documentação",
          click: () => shell.openExternal("https://docs.exemplo.com"),
        },
        {
          label: "Suporte",
          click: () => shell.openExternal("https://suporte.exemplo.com"),
        },
        { type: "separator" },
        {
          label: "Sobre",
          click: () => showAboutDialog(),
        },
      ],
    },
  ];

  // Ajustes para macOS
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: "Sobre " + app.getName(), role: "about" },
        { type: "separator" },
        { label: "Serviços", role: "services", submenu: [] },
        { type: "separator" },
        {
          label: "Ocultar " + app.getName(),
          accelerator: "Command+H",
          role: "hide",
        },
        {
          label: "Ocultar Outros",
          accelerator: "Command+Shift+H",
          role: "hideothers",
        },
        { label: "Mostrar Todos", role: "unhide" },
        { type: "separator" },
        { label: "Sair", accelerator: "Command+Q", click: () => app.quit() },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// Função para mostrar dialog sobre
const showAboutDialog = () => {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 350,
    parent: mainWindow,
    modal: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  aboutWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .version {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin: 10px 0;
          }
          .description {
            color: rgba(255,255,255,0.8);
            margin: 20px 0;
          }
          .footer {
            color: rgba(255,255,255,0.6);
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="logo">🍽️</div>
        <h2>Food Platform Admin</h2>
        <div class="version">Versão 0.1.0</div>
        <p class="description">Sistema de Gestão de Pedidos e Produtos</p>
        <p class="footer">© 2025 Todos os direitos reservados</p>
      </body>
    </html>
  `);
};

// Função para importar produtos
const importProducts = async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Importar Produtos",
    filters: [
      { name: "Arquivos CSV", extensions: ["csv"] },
      { name: "Arquivos Excel", extensions: ["xlsx", "xls"] },
      { name: "Todos os arquivos", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    mainWindow.webContents.send("import-products", filePath);
  }
};

// Função para exportar produtos
const exportProducts = async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Exportar Produtos",
    defaultPath: "produtos.csv",
    filters: [
      { name: "Arquivos CSV", extensions: ["csv"] },
      { name: "Arquivos Excel", extensions: ["xlsx"] },
    ],
  });

  if (!result.canceled && result.filePath) {
    mainWindow.webContents.send("export-products", result.filePath);
  }
};

// Criar janela principal
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Food Platform Admin",
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: !isDev, // Permitir CORS em desenvolvimento
    },
  });

  // Carregar URL baseado no ambiente
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Eventos da janela
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("focus", () => {
    mainWindow.webContents.send("window-focus", true);
  });

  mainWindow.on("blur", () => {
    mainWindow.webContents.send("window-focus", false);
  });

  // Prevenir navegação externa
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (
      !url.startsWith("http://localhost:5173") &&
      !url.startsWith("file://")
    ) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Interceptar downloads de imagens
  mainWindow.webContents.session.on(
    "will-download",
    (event, item, webContents) => {
      // Permitir download de imagens
      const fileName = item.getFilename();
      const ext = path.extname(fileName).toLowerCase();

      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        item.setSavePath(path.join(app.getPath("downloads"), fileName));
      }
    }
  );
};

// Criar nova janela de workspace
const createWorkspaceWindow = (workspaceId) => {
  const workspaceWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: `Workspace - ${workspaceId || "Novo"}`,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    workspaceWindow.loadURL(
      `http://localhost:5173?workspace=${workspaceId || "new"}`
    );
  } else {
    workspaceWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  if (workspaceId) {
    workspaceWindows.set(workspaceId, workspaceWindow);
  }

  workspaceWindow.on("closed", () => {
    if (workspaceId) {
      workspaceWindows.delete(workspaceId);
    }
  });

  return workspaceWindow;
};

// IPC Handlers para funcionalidades existentes
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("open-workspace", (event, workspaceId) => {
  if (workspaceWindows.has(workspaceId)) {
    const existingWindow = workspaceWindows.get(workspaceId);
    existingWindow.focus();
  } else {
    createWorkspaceWindow(workspaceId);
  }
});

ipcMain.handle("get-workspaces", async () => {
  // Mock data - em produção viria do banco de dados
  return [
    { id: "1", name: "Restaurante Principal", logo: "🍕" },
    { id: "2", name: "Lanchonete Centro", logo: "🍔" },
    { id: "3", name: "Pizzaria Express", logo: "🍕" },
  ];
});

// IPC Handlers para produtos
ipcMain.handle("upload-product-image", async (event, imageData, fileName) => {
  try {
    const uploadsDir = path.join(
      app.getPath("userData"),
      "uploads",
      "products"
    );

    // Criar diretório se não existir
    await fs.mkdir(uploadsDir, { recursive: true });

    // Gerar nome único para o arquivo
    const ext = path.extname(fileName);
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Converter base64 para buffer se necessário
    let buffer;
    if (typeof imageData === "string" && imageData.startsWith("data:")) {
      const base64Data = imageData.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = Buffer.from(imageData);
    }

    // Salvar arquivo
    await fs.writeFile(filePath, buffer);

    // Retornar URL local
    return `file://${filePath}`;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
});

ipcMain.handle("delete-product-image", async (event, imagePath) => {
  try {
    if (imagePath.startsWith("file://")) {
      const localPath = imagePath.replace("file://", "");
      await fs.unlink(localPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    return false;
  }
});

ipcMain.handle("get-products", async (event, workspaceId, filters) => {
  // Mock data - em produção viria do banco de dados
  console.log(`Buscando produtos para workspace ${workspaceId}`, filters);

  // Simular dados de produtos
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  };
});

ipcMain.handle("save-product", async (event, productData) => {
  // Mock - em produção salvaria no banco
  console.log("Salvando produto:", productData);
  return { success: true, id: Date.now().toString() };
});

ipcMain.handle("delete-product", async (event, productId) => {
  // Mock - em produção deletaria do banco
  console.log("Deletando produto:", productId);
  return { success: true };
});

// IPC para combos
ipcMain.handle("get-combos", async (event, workspaceId) => {
  console.log(`Buscando combos para workspace ${workspaceId}`);
  return [];
});

ipcMain.handle("save-combo", async (event, comboData) => {
  console.log("Salvando combo:", comboData);
  return { success: true, id: Date.now().toString() };
});

// IPC para categorias
ipcMain.handle("get-categories", async (event, workspaceId) => {
  console.log(`Buscando categorias para workspace ${workspaceId}`);
  return [
    { id: "1", name: "Lanches", icon: "🍔", active: true },
    { id: "2", name: "Pizzas", icon: "🍕", active: true },
    { id: "3", name: "Bebidas", icon: "🥤", active: true },
    { id: "4", name: "Sobremesas", icon: "🍨", active: true },
  ];
});

// IPC Handler para atualização de status de pedidos
ipcMain.handle("update-order-status", async (event, orderId, newStatus) => {
  console.log(`Atualizando pedido ${orderId} para status ${newStatus}`);

  // Broadcast para todas as janelas
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("order-status-updated", { orderId, newStatus });
  });

  return { success: true, orderId, newStatus };
});

// IPC para importação/exportação
ipcMain.handle("read-import-file", async (event, filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    return fileContent;
  } catch (error) {
    console.error("Erro ao ler arquivo:", error);
    throw error;
  }
});

ipcMain.handle("write-export-file", async (event, filePath, data) => {
  try {
    await fs.writeFile(filePath, data, "utf8");
    return { success: true };
  } catch (error) {
    console.error("Erro ao escrever arquivo:", error);
    throw error;
  }
});

// App Events
app.whenReady().then(() => {
  createMenu();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Auto-updater (para produção)
if (!isDev) {
  // Importação dinâmica para auto-updater
  const setupAutoUpdater = async () => {
    try {
      const { autoUpdater } = await import("electron-updater");

      app.on("ready", () => {
        autoUpdater.checkForUpdatesAndNotify();
      });

      autoUpdater.on("update-available", () => {
        mainWindow?.webContents.send("update-available");
      });

      autoUpdater.on("update-downloaded", () => {
        mainWindow?.webContents.send("update-downloaded");
      });
    } catch (error) {
      console.error("Erro ao configurar auto-updater:", error);
    }
  };

  setupAutoUpdater();
}

// Tratamento de erros
process.on("uncaughtException", (error) => {
  console.error("Erro não capturado:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promise rejeitada:", error);
});
