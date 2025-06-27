const { contextBridge, ipcRenderer } = require('electron');

console.log("PRELOADING STUFFS");
contextBridge.exposeInMainWorld('electronAPI', {
  sendKittyData: (data) => ipcRenderer.send('kitty-data', data),
});