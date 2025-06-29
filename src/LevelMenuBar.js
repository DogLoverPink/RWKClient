const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain, dialog} = require('electron');
const levelThing = require("./level.js");


function printSavedLevelNames() {
    try {
        const scriptPath = path.join(__dirname, '../embeddedscripts/getSavedLevelNames.js');
        const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
        storage.window.webContents.executeJavaScript(scriptCode);
    } catch (e) {
        console.error(e);
    }

}

let levelNames = [];
let areThereAnyLevels = false;

ipcMain.on("updateUserSavedLevelsList", (event, data) => {
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
  console.log(levelNames.length);
  areThereAnyLevels = levelNames.length > 0;

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
    storage.window.webContents.send('getLevelHash', name, false, "duplicateNamedLevel");
}

function copyCurrentLevel() {
  if (!areThereAnyLevels) {
      dialog.showErrorBox("Error!", `You need at least 1 created level in your makermall for this to work!
        \n(It doesn't need to have any content or be uploaded, it just needs to exist)
        \nDon't ask me why man, it's just how it works
        \n(Also, make sure to do Level -> Refresh Known Levels after you create it)`)
      return;
    }
  storage.window.webContents.send('getLevelHash', null, true, "duplicateNamedLevel");
}


ipcMain.on("duplicateNamedLevel", (event, data) => {
    var level = new levelThing.Level;
    const buf = Buffer.from(data, "base64");
    console.log("recieved ping!");
    
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
    printSavedLevelNames,
    copyCurrentLevel,
};