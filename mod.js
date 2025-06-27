const { app, Menu, BrowserWindow, ipcRenderer, ipcMain, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const path = require('path');
const fs = require('fs');
const dataPath = path.join(app.getPath('userData'), 'RWKClientStorage');
var win;
app.setPath('userData', dataPath);

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
            nodeIntegration: false
        }
    });

    createMenuToolBar();

    win.loadURL('http://127.0.0.1:8080/');
});


function printLevelHash() {
    console.log("test");
    getLevelInfo();
}



function createMenuToolBar() {
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'Get Level Hash', click: printLevelHash },
                { type: 'separator' },
                { label: 'Exit', role: 'quit' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

ipcMain.on("kitty-data", (event, data) => {
    console.log("Got kitty data from renderer:", data);
});

function getLevelInfo() {

    const scriptPath = path.join(__dirname, 'embeddedscripts/getCurrentLevelHash.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
    win.webContents.executeJavaScript(scriptCode);
}