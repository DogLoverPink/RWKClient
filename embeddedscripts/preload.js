const { contextBridge, ipcRenderer} = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  printToAppConsole: (data) => {
    console.log("sending :"+typeof data);
    ipcRenderer.send('printMessage', typeof data === 'string' ? data : JSON.stringify(data));
  },
  duplicateLevel: (callback) => ipcRenderer.on('duplicateLevel', callback),
  updateUserSavedLevelsList: (data) => {
    ipcRenderer.send('updateUserSavedLevelsList', typeof data === 'string' ? data : JSON.stringify(data));
  },
});