const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain } = require('electron');
const levelThing = require("./level.js");
const { dialog } = require('electron');
const prompt = require('electron-prompt');

function getCurrentLevelId() {
  // storage.window.webContents.send('getIndexDBFile', "/RAPTISOFT_SANDBOX/RWK/MMRESUME-95586.sav", "printCurrentLevelId");
  storage.window.webContents.send('getIndexDBFile', "/RAPTISOFT_SANDBOX/RWK/recent.levels", "printCurrentLevelId");
}

ipcMain.on('preload-finished', () => {
  let practiceStorage = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels');

  if (!fs.existsSync(practiceStorage)) {
    fs.mkdirSync(practiceStorage, { recursive: true });
  }
});


ipcMain.on("printCurrentLevelId", (event, data) => {
  console.log("Level id: "+printLevelID(data));
});

function printLevelID(data) {
  const text = Buffer.from(data.contents).toString('utf8');

  //skipping over binary garbage
  const start = text.indexOf('[NAME]');
  if (start === -1) {
    throw new Error('Start tag not found');
  }
  const cleanText = text.slice(start);
  const match = cleanText.match(/\[ID\](\d+)\[\/ID\]/);
  const id = match ? match[1] : null;

  return id;
}


module.exports = {
  getCurrentLevelId
};