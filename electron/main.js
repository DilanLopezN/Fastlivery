const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
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
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
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
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; text-align: center;">
                  <h2>Food Platform Admin</h2>
                  <p>Versão 0.1.0</p>
                  <p style="color: #666;">Sistema de Gestão de Pedidos</p>
                  <p style="color: #999; font-size: 12px;">© 2025 Todos os direitos reservados</p>
                </body>
              </html>
            `);
          },
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

// Criar janela principal
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "Food Platform Admin",
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
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
};

// Criar nova janela de workspace
const createWorkspaceWindow = (workspaceId) => {
  const workspaceWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
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

// IPC Handlers
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
  // Aqui você buscaria os workspaces do banco de dados
  return [
    { id: "1", name: "Restaurante Principal", logo: "🍕" },
    { id: "2", name: "Lanchonete Centro", logo: "🍔" },
    { id: "3", name: "Pizzaria Express", logo: "🍕" },
  ];
});

ipcMain.handle("update-order-status", async (event, orderId, newStatus) => {
  // Aqui você atualizaria o status no banco de dados
  console.log(`Atualizando pedido ${orderId} para status ${newStatus}`);

  // Broadcast para todas as janelas
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("order-status-updated", { orderId, newStatus });
  });

  return { success: true, orderId, newStatus };
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
  const { autoUpdater } = require("electron-updater");

  app.on("ready", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update-available");
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-downloaded");
  });
}

// Tratamento de erros
process.on("uncaughtException", (error) => {
  console.error("Erro não capturado:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promise rejeitada:", error);
});
