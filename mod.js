const { app, Menu, BrowserWindow, ipcMain, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const path = require('path');
const menuBar = require("./src/MenuBarHandling.js");
const dataPath = path.join(app.getPath('userData'), 'RWKClientStorage');
const storage = require('./src/StaticMembers.js');
var win;
app.setPath('userData', dataPath);

storage.app = app;

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
            nodeIntegration: true
        }
    });
    storage.window = win;
    storage.runEmbeddedScripts.apply();
    

    storage.menu = Menu;
    menuBar.createMenuToolBar();

    win.loadURL('http://127.0.0.1:8080/');
});




ipcMain.on("printMessage", (event, data) => {
    try {
        const parsed = JSON.parse(data);
        console.log("Got kitty json data from renderer:", parsed);
        updateCopyLevelMenu(data);
    } catch {
        console.log("Got kitty data from renderer:", data);
    }
});


