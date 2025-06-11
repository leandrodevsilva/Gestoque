const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Manter referência global da janela
let mainWindow;

function createWindow() {
  // Definir o caminho do ícone
  let iconPath;
  if (isDev) {
    iconPath = path.join(__dirname, 'public', 'icon.png');
  } else {
    // Em produção, o ícone pode estar em diferentes locais dependendo da plataforma
    const possiblePaths = [
      path.join(__dirname, 'public', 'icon.png'),
      path.join(__dirname, '..', 'public', 'icon.png'),
      path.join(process.resourcesPath, 'public', 'icon.png'),
      path.join(app.getAppPath(), 'public', 'icon.png')
    ];
    
    const fs = require('fs');
    iconPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  }

  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: iconPath, // Definir o ícone da janela
  webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    show: false, // Não mostrar até estar pronto
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: false
  });

  // Carregar a aplicação
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'dist/index.html')}`;
  
  console.log('Carregando URL:', startUrl);
  console.log('Modo desenvolvimento:', isDev);
  console.log('Caminho do ícone:', iconPath);
  console.log('Diretório do app:', app.getAppPath());
  
  mainWindow.loadURL(startUrl);

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Abrir DevTools apenas em desenvolvimento
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitido quando a janela é fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Interceptar links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevenir navegação para URLs externas
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = new URL(startUrl);
    
    if (parsedUrl.origin !== currentUrl.origin && !isDev) {
      event.preventDefault();
    }
  });

  // Tratar erros de carregamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Falha ao carregar:', errorCode, errorDescription, validatedURL);
    
    if (isDev) {
      // Em desenvolvimento, tentar novamente após um delay
      setTimeout(() => {
        mainWindow.loadURL(startUrl);
      }, 2000);
    }
  });
}

// Criar menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo Backup',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            // Enviar evento para a aplicação React
            if (mainWindow) {
              mainWindow.webContents.send('menu-backup');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Refazer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Recortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Forçar Recarregar', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Ferramentas do Desenvolvedor', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Zoom Real', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Aumentar Zoom', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Diminuir Zoom', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Fechar', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre o Sistema de Canecas',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Estoque - Canecas',
              detail: 'Versão 1.0.0\n\nSistema completo para gerenciamento de estoque de canecas personalizadas.\n\nDesenvolvido com React, TypeScript e Electron.'
            });
          }
        },
        {
          label: 'Manual do Usuário',
          click: () => {
            shell.openExternal('https://github.com/seu-usuario/sistema-estoque-canecas/blob/main/MANUAL_USUARIO.md');
          }
        }
      ]
    }
  ];

  // Ajustes específicos para macOS
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'Sobre ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Serviços', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Ocultar ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Ocultar Outros', accelerator: 'Command+Shift+H', role: 'hideothers' },
        { label: 'Mostrar Todos', role: 'unhide' },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Este método será chamado quando o Electron terminar de inicializar
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    // No macOS, é comum recriar uma janela quando o ícone do dock é clicado
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  // No macOS, é comum que aplicações e sua barra de menu permaneçam ativas
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Configurações de segurança
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Prevenir navegação para URLs externas
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

// Configurar handlers IPC
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('save-backup', async (event, backupPath, filename, content) => {
  try {
    const fs = require('fs').promises;
    const fullPath = path.join(backupPath);
    
    // Criar diretório de backup se não existir
    await fs.mkdir(fullPath, { recursive: true });
    
    // Salvar o arquivo
    await fs.writeFile(path.join(fullPath, filename), content);
    return true;
  } catch (error) {
    console.error('Erro ao salvar backup:', error);
    return false;
  }
});

// Log de informações úteis
console.log('Electron iniciado');
console.log('Versão do Electron:', process.versions.electron);
console.log('Versão do Node:', process.versions.node);
console.log('Diretório atual:', __dirname);
