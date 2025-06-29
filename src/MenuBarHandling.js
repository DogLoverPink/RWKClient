const { printSavedLevelNames, copyCurrentLevel } = require("./LevelMenuBar.js");
const { printLevelHash, setCurrentlyEditedKittyLocation, refreshSavedKitty} = require("./EditorMenuBar.js");
const {importFile, deleteFileList, getLevelSaves, downloadFile, downloadFileList} = require("./FileMenuBar.js");
const {getCurrentLevelId, startPracticeMode, endPracticeMode, createCheckpoint, restartFromCheckpoint, openPracticeHelpMenu} = require("./PracticeMenuBar.js");
const path = require('path');
const storage = require('./StaticMembers.js');
const { ipcMain} = require('electron');


function populateSavedLevelNames() {
    printSavedLevelNames.apply();
}

function createMenuToolBar() {
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'Import File', click: importFile },
                { label: 'Export File', click: downloadFile },
                { label: 'Export File (List)', click: downloadFileList },
                { label: 'Delete File (List)', click: deleteFileList },
                { label: 'Print File List (dev)', click: getLevelSaves },
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
                { label: 'Copy Current Level Base64 To Clipboard', click: printLevelHash },
                { label: 'Set Currently Edited .kitty File', click: setCurrentlyEditedKittyLocation },
                { label: 'Upload Current .kitty File', click: refreshSavedKitty },
                { type: 'separator' },
            ],
        },
        {
            label: 'Practice',
            submenu: [
                { label: 'Start Practice', click: startPracticeMode },
                { label: 'Create Checkpoint', click: createCheckpoint },
                { label: 'Restart From Checkpoint', click: restartFromCheckpoint },
                { label: 'End Practice', click: endPracticeMode },
                { label: 'Get Current Level ID (dev)', click: getCurrentLevelId },
                { type: 'separator' },
                { label: 'Help', click: openPracticeHelpMenu },
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