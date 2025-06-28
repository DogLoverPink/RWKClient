const { contextBridge, ipcRenderer} = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  printToAppConsole: (data) => {
    console.log("sending :"+typeof data);
    ipcRenderer.send('printMessage', typeof data === 'string' ? data : JSON.stringify(data));
  },
  getLevelHash: (callback, getCurrent) => ipcRenderer.on('getLevelHash', callback, getCurrent),
  duplicateLevel: (callback, levelName, levelHash) => ipcRenderer.on('duplicateLevel', callback, levelName, levelHash),
  updateUserSavedLevelsList: (data) => {
    ipcRenderer.send('updateUserSavedLevelsList', typeof data === 'string' ? data : JSON.stringify(data));
  },
  sendCustomIPC: (ipcSignalName, data) => ipcRenderer.send(ipcSignalName, data),
});
