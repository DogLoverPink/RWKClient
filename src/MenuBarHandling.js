const { printLevelHash, printSavedLevelNames } = require("./LevelMenuBar.js");
const path = require('path');
const storage = require('./StaticMembers.js');

function test() {
    console.log("rgdfgdfgdfg");
}

function createMenuToolBar() {
    printSavedLevelNames.apply();
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
                { label: 'Duplicate Level', 
                    submenu: [],
                    click: () => console.log("not implemented!"),
                 },
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
    storage.menuTemplate = template;

    const menu = storage.menu.buildFromTemplate(template);
    storage.menu.setApplicationMenu(menu);
}

module.exports = { createMenuToolBar };