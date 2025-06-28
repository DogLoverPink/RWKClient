const { app, Menu, BrowserWindow, ipcMain, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const path = require('path');
const fs = require('fs');
const menuBar = require("./src/MenuBarHandling.js");
const browserDataPath = path.join(app.getPath('userData'), 'RWKClientStorage');
const clientFileStorageFolder = path.join(browserDataPath, 'RWKClientFileStorage');
const storage = require('./src/StaticMembers.js');
var win;
app.setPath('userData', browserDataPath);

storage.app = app;
storage.clientFileStorageFolder = clientFileStorageFolder;

if (!fs.existsSync(clientFileStorageFolder)) {
    fs.mkdirSync(clientFileStorageFolder, { recursive: true });
}


app.whenReady().then(async () => {
    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
    blocker.enableBlockingInSession(session.defaultSession);


    win = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'embeddedscripts/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });
    storage.window = win;
    

    storage.menu = Menu;
    menuBar.createMenuToolBar();

    win.loadURL(storage.RWKURL);
});

ipcMain.handle('get-rwk-url', () => storage.RWKURL);



ipcMain.on('preload-finished', () => {
    console.log("finished poreload");
  storage.runEmbeddedScripts();
  menuBar.populateSavedLevelNames();
});






ipcMain.on("printMessage", (event, data) => {
    try {
        const parsed = JSON.parse(data);
        console.log("Got kitty json data from renderer:", parsed);
    } catch {
        console.log("Got kitty data from renderer:", data);
    }
});


