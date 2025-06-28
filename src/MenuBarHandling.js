const { printLevelHash, printSavedLevelNames, copyCurrentLevel } = require("./LevelMenuBar.js");
const {getLevelSaves, downloadFile, downloadFileList} = require("./FileMenuBar.js");
const {getCurrentLevelId} = require("./PracticeMenuBar.js");
const path = require('path');
const storage = require('./StaticMembers.js');
const { ipcMain} = require('electron');

function test() {
    console.log("rgdfgdfgdfg");
}

function populateSavedLevelNames() {
    printSavedLevelNames.apply();
}

function createMenuToolBar() {
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'Export File', click: downloadFile },
                { label: 'Export File (List)', click: downloadFileList },
                { label: 'Print File List', click: getLevelSaves },
                { type: 'separator' },
                { label: 'Exit', role: 'quit' },
            ],
        },
        {
            label: 'Level',
            submenu: [
                { label: 'Duplicate Level', 
                    submenu: [],
                 },
                { label: 'Download Current Level', click: copyCurrentLevel },
                { label: 'Refresh Known Levels', click: printSavedLevelNames },
            ],
        },
        {
            label: 'Editor',
            submenu: [
                { label: 'Get Current Level Hash', click: printLevelHash },
                { type: 'separator' },
            ],
        },
        {
            label: 'Practice',
            submenu: [
                { label: 'Get Current Level ID', click: getCurrentLevelId },
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
    storage.menuTemplate = template;

    const menu = storage.menu.buildFromTemplate(template);
    storage.menu.setApplicationMenu(menu);
}



module.exports = { createMenuToolBar, populateSavedLevelNames };