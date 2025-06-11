const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs do Electron de forma segura
contextBridge.exposeInMainWorld('electron', {
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  saveBackup: (backupPath, filename, content) => ipcRenderer.invoke('save-backup', backupPath, filename, content)
});
