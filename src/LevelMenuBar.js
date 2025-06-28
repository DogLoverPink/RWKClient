const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain} = require('electron');
const levelThing = require("./level.js");

function printLevelHash() {
    console.log("test");
    storage.window.webContents.send('getLevelHash', null, true, "printMessage");
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
    storage.window.webContents.send('getLevelHash', name, false, "printCurrentLevelName");
    // storage.window.webContents.send('duplicateLevel', name);
}


ipcMain.on("printCurrentLevelName", (event, data) => {
    var level = new levelThing.Level;
    const buf = Buffer.from(data, "base64");
    
    level.deserialize(buf, 1);
    console.log("namey before: "+level.name);
    level.name = incrementString(String(level.name));
    console.log("Name: "+level.name);
    let levelString = level.serialize();
    storage.window.webContents.send('duplicateLevel', level.name, levelString);
});

function incrementString(input) {
  const match = input.match(/^(.*?)(\d+)$/);

  if (match) {
    const base = match[1];
    const number = match[2];
    const incremented = String(Number(number) + 1);
    return base + incremented;
  } else {
    return input + "2";
  }
}

module.exports = {
    printLevelHash,
    printSavedLevelNames
};