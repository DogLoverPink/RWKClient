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

function startPracticeMode() {
  storage.window.webContents.send('getIndexDBFile', "/RAPTISOFT_SANDBOX/RWK/recent.levels", "beginPracticeModeIdGet");
}

function createCheckpoint() {
  if (!storage.persistantStorage.get("isCurrentlyPracticing")) {
    dialog.showErrorBox(title = "Error!", content = "Not currently Practicing!");
    return;
  }
  let id = storage.persistantStorage.get("practiceLevelID");
  let saveName = "/RAPTISOFT_SANDBOX/RWK/MMRESUME-" + id + ".sav"
  storage.window.webContents.send('getIndexDBFile', saveName, "createPracticeModeCheckpoint");
  console.log("Got Level id: " + id);
}

function restartFromCheckpoint() {
  if (!storage.persistantStorage.get("isCurrentlyPracticing")) {
    dialog.showErrorBox(title = "Error!", content = "Not currently Practicing!");
    return;
  }
  const fileToRead = storage.persistantStorage.get("practiceFileName") + ".PRACTICESTART.json";
  const outputPath = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels/' + fileToRead);

  writeLevel(outputPath);
}

let fileName = "noneH";

ipcMain.on("beginPracticeModeIdGet", (event, data) => {
  let id = getIdFromRecentLevelsFile(data);
  let saveName = "/RAPTISOFT_SANDBOX/RWK/MMRESUME-" + id + ".sav"
  fileName = storage.getFileName(saveName);
  storage.persistantStorage.set("practiceFilePath", saveName);
  storage.persistantStorage.set("practiceFileName", fileName);
  storage.persistantStorage.set("practiceLevelID", id);
  storage.window.webContents.send('getIndexDBFile', saveName, "beginPracticeModeFileSave");
  console.log("Got Level id: " + id);
});

ipcMain.on("createPracticeModeCheckpoint", (event, data) => {
  if (!data) {
    dialog.showErrorBox(title = "No Save File", content = "The save file for this level does not exist yet.\n" +
      "Please either wait and play more, or quit and rejoin, then try again!");
    return
  }
  console.log(data.contents.length);
  console.log(data.timestamp);
  if (data.contents.length == storage.persistantStorage.get("lastPracticeSaveLength")) {
    dialog.showErrorBox(title = "Save File Stale", content = "The save file for this level exists, but is stale.\n" +
      "This checkpoint would be the same as your last one, please quit and rejoin or try again!");
    return
  }
  const practiceStorage = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels');
  const fileObject = {
    mode: data.mode,
    timestamp: data.timestamp,
    contents: Buffer.from(data.contents).toString('base64'),
  };

  outputPath = path.join(practiceStorage, fileName + ".PRACTICESTART.json");
  fs.writeFileSync(outputPath, JSON.stringify(fileObject, null, 2));
  storage.persistantStorage.set("lastPracticeSaveLength", data.contents.length);
  dialog.showMessageBox(options = {
    type: 'info',
    buttons: ['Great!'],
    message: 'Checkpoint Saved!',
  });
});


ipcMain.on("beginPracticeModeFileSave", (event, data) => {
  if (!data) {
    dialog.showErrorBox(title = "No Save File", content = "The save file for this level does not exist yet.\n" +
      "Please either wait and play more, or quit and rejoin, then try again!");
    return
  }
  console.log(data.contents.length);
  console.log(data.timestamp);
  if (data.contents.length == storage.persistantStorage.get("lastPracticeSaveLength")) {
    dialog.showErrorBox(title = "Save File Stale", content = "The save file for this level exists, but is stale.\n" +
      "Progress would be lost if practice started. Either quit/rejoin, die or play more of the level and try again");
    return
  }
  if (storage.persistantStorage.get("isCurrentlyPracticing")) {
    dialog.showErrorBox(title = "Already Practing!", content = "You're already practicing " + storage.persistantStorage.get("practiceFileName"));
    return
  }
  const practiceStorage = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels');
  const fileObject = {
    mode: data.mode,
    timestamp: data.timestamp,
    contents: Buffer.from(data.contents).toString('base64'),
  };

  console.log("Begining actualy Saving: ");

  let outputPath = path.join(practiceStorage, fileName + ".SAVE.json");
  fs.writeFileSync(outputPath, JSON.stringify(fileObject, null, 2));
  outputPath = path.join(practiceStorage, fileName + ".PRACTICESTART.json");
  fs.writeFileSync(outputPath, JSON.stringify(fileObject, null, 2));
  console.log("Setting isPracticing to true! ");
  storage.persistantStorage.set("isCurrentlyPracticing", true);
  storage.persistantStorage.set("lastPracticeSaveLength", data.contents.length);
  dialog.showMessageBox(options = {
    type: 'info',
    buttons: ['Great!'],
    message: 'Your practice has started!',
    detail: "Please don't cheat UwU",
  });
});

ipcMain.on('preload-finished', () => {
  const practiceStorage = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels');

  if (!fs.existsSync(practiceStorage)) {
    fs.mkdirSync(practiceStorage, { recursive: true });
  }
});

function endPracticeMode() {
  if (!storage.persistantStorage.get("isCurrentlyPracticing")) {
    dialog.showErrorBox(title = "Error!", content = "Not currently Practicing!");
    return;
  }
  const fileToRead = storage.persistantStorage.get("practiceFileName") + ".SAVE.json";
  console.log("Reading file: " + fileToRead)
  const outputPath = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels/' + fileToRead);

  writeLevel(outputPath);
  storage.persistantStorage.set("isCurrentlyPracticing", false);
}

function writeLevel(outputPath) {
  if (fs.existsSync(outputPath)) {
    const fileContents = fs.readFileSync(outputPath, 'utf-8');
    const levelData = JSON.parse(fileContents);

    levelData.contents = Buffer.from(levelData.contents, 'base64');

    console.dir(levelData);

    storage.window.webContents.send('writeLevelFile', storage.persistantStorage.get("practiceFilePath"), levelData.contents, new Date(), levelData.mode, storage.persistantStorage.get("practiceLevelID"));

  } else {
    console.log("Level file error:");
    dialog.showErrorBox(title = "Error!", content = "File not found: " + outputPath);
  }
}


ipcMain.on("printCurrentLevelId", (event, data) => {
  console.log("Level id: " + getIdFromRecentLevelsFile(data));
});

function getIdFromRecentLevelsFile(recentLevelsFile) {
  const text = Buffer.from(recentLevelsFile.contents).toString('utf8');

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
  getCurrentLevelId,
  startPracticeMode,
  endPracticeMode,
  createCheckpoint,
  restartFromCheckpoint,
};