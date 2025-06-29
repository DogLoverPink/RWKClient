const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const levelThing = require("./level.js");
const { ipcMain, dialog } = require('electron');
const { clipboard } = require('electron')


function printLevelHash() {
  console.log("Copied level hash to clipboard")
  storage.window.webContents.send('getLevelHash', null, true, "copyHashToClipboard");
}

ipcMain.on("copyHashToClipboard", (event, data) => {
  clipboard.writeText(String(data));
});


const fileFilter = [
  { name: 'Kitty Files', extensions: ['kitty'] },
];

function setCurrentlyEditedKittyLocation() {
  const result = dialog.showOpenDialogSync({ properties: ['openFile',], filters: fileFilter });
  if (!result) {
    return;
  }
  console.log("Setting currently edited .kitty file to: " + result[0])
  storage.persistantStorage.set("Editor-Currently-Edited-Kitty-File", result[0]);

}

function refreshSavedKitty() {
  if (!storage.persistantStorage.has("Editor-Currently-Edited-Kitty-File")) {
    dialog.showErrorBox(title = "Error!", content = "Set .kitty file location first!");
    return;
  }
  const filePath = storage.persistantStorage.get("Editor-Currently-Edited-Kitty-File");
  if (!fs.existsSync(filePath)) {
    dialog.showErrorBox(title = "Error!", content = "Target .kitty file no longer exists!");
    return;
  }
  const readFile = fs.readFileSync(filePath);
  var level = new levelThing.Level;
  level.deserialize(readFile, 1);
  const actualName = getKittyFileName(filePath);
  level.name = actualName;
  let levelString = level.serialize();
  storage.window.webContents.send('duplicateLevel', actualName, levelString);
}

function getKittyFileName(input) {
  input = storage.getFileName(input);
  return input.substring(0, input.length - 6);
}


module.exports = {
  printLevelHash,
  setCurrentlyEditedKittyLocation,
  refreshSavedKitty
};