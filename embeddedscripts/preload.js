const { contextBridge, dialog, ipcRenderer} = require('electron');
const {storage} = require("../src/StaticMembers");


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
  getLevelsData: (callback, callbackIPCName) => ipcRenderer.on("getLevelsData", callback, callbackIPCName),
  downloadIndexDBFile: (callback, fileName) => ipcRenderer.on("downloadIndexDBFile", callback, fileName),
  getIndexDBFile: (callback, fileName, ipcCallbackName) => ipcRenderer.on("getIndexDBFile", callback, fileName,ipcCallbackName),
});


ipcRenderer.send('preload-finished');
