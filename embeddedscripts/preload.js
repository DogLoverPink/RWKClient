const { contextBridge, ipcRenderer} = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
  printToAppConsole: (data) => {
    console.log("sending :"+typeof data);
    ipcRenderer.send('printMessage', typeof data === 'string' ? data : JSON.stringify(data));
  },
});