const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain} = require('electron');

function printLevelHash() {
    console.log("test");
    try {
        const scriptPath = path.join(__dirname, '../embeddedscripts/getSavedLevelHash.js');
        const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
        storage.window.webContents.executeJavaScript(scriptCode);
    } catch (e) {
        console.error(e);
    }
}

function printSavedLevelNames() {
    try {
        const scriptPath = path.join(__dirname, '../embeddedscripts/getSavedLevelNames.js');
        const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
        storage.window.webContents.executeJavaScript(scriptCode);
    } catch (e) {
        console.error(e);
    }

}

ipcMain.on("updateUserSavedLevelsList", (event, data) => {
    let levelNames;
    levelNames = JSON.parse(data);
    levelNames = levelNames.map(levelName => {
        levelName = levelName.split('\/').pop().split(".")[0];
        return levelName;
    });
    console.log(levelNames);
    updateCopyLevelMenu(levelNames);
});

function updateCopyLevelMenu(newLevels) {
  levelNames = newLevels;

  const copyLevelSubmenu = levelNames.map(levelName => ({
    label: levelName,
    click: () => {
      duplicateLevel(levelName);
    },
  }));

  // Find and update the submenu
  const levelMenu = storage.menuTemplate.find(item => item.label === 'Level');
  const copyMenuItem = levelMenu.submenu.find(item => item.label === 'Duplicate Level');
  copyMenuItem.submenu = copyLevelSubmenu;

  // Rebuild the entire menu
  const menu = storage.menu.buildFromTemplate(storage.menuTemplate);
  storage.menu.setApplicationMenu(menu);
}

function duplicateLevel(name) {
    console.log("Copying level:", name);
    storage.window.webContents.send('duplicateLevel', name);
}

module.exports = {
    printLevelHash,
    printSavedLevelNames
};