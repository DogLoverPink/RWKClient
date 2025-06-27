const { app, Menu, BrowserWindow, ipcMain, session } = require('electron');
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

function printSavedLevelNames() {
    const scriptPath = path.join(__dirname, 'embeddedscripts/getSavedLevelNames.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
    console.log("START EXECUTE JAVASCRIPT:");
    win.webContents.executeJavaScript(scriptCode);
    console.log("END EXECUTE JAVASCRIPT:");
}



function createMenuToolBar() {
    const template = [
        {
            label: 'File',
            submenu: [
                { type: 'separator' },
                { label: 'Exit', role: 'quit' },
            ],
        },
        {
            label: 'Level',
            submenu: [
                { label: 'Copy Level (WIP)', click: () => console.log("not implemented!") },
                { label: 'Paste Level (WIP)', click: () => console.log("not implemented!") },
            ],
        },
        {
            label: 'Editor',
            submenu: [
                { label: 'Get Current Level Hash', click: printLevelHash },
                { label: 'Get Saved Level Names', click: printSavedLevelNames },
                { type: 'separator' },
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

ipcMain.on("printMessage", (event, data) => {
    try {
        const parsed = JSON.parse(data);
        console.log("Got kitty data from renderer:", parsed);
    } catch {
        console.log("Got kitty data from renderer:", data);
    }
});

function getLevelInfo() {

    const scriptPath = path.join(__dirname, 'embeddedscripts/getSavedLevelHash.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
    win.webContents.executeJavaScript(scriptCode);
}