const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain } = require('electron');
const levelThing = require("./level.js");
const { dialog } = require('electron');
const betterprompt = require('custom-electron-prompt')

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
    return;
  }
  console.log(data.contents.length);
  console.log(data.timestamp);
  if (data.contents.length == storage.persistantStorage.get("lastPracticeSaveLength")) {
    dialog.showErrorBox(title = "Save File Stale", content = "The save file for this level exists, but is stale.\n" +
      "This checkpoint would be the same as your last one, please quit and rejoin or try again!");
    return;
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
    return;
  }
  console.log(data.contents.length);
  console.log(data.timestamp);
  if (storage.persistantStorage.get("isCurrentlyPracticing")) {
    dialog.showErrorBox(title = "Already Practing!", content = "You're already practicing " + storage.persistantStorage.get("practiceFileName"));
    return;
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

let hasRegistered = false;

ipcMain.on('preload-finished', () => {
  const practiceStorage = path.join(storage.clientFileStorageFolder, 'SavedPracticeModeLevels');

  if (!fs.existsSync(practiceStorage)) {
    fs.mkdirSync(practiceStorage, { recursive: true });
  }
  if (!hasRegistered) {
    registerWindowCloseListener();
    hasRegistered = true;
  }
});

function registerWindowCloseListener() {
  storage.window.on("close", (event) => {
    if (storage.persistantStorage.get("isCurrentlyPracticing") == true) {
      event.preventDefault();
      endPracticeMode();
      setTimeout(() => {
        storage.window.close()
      }, 500)
    }
  });
}

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

const darkCssPath = path.join(__dirname, '../css', 'darkmode.css');

function openPracticeHelpMenu() {
  betterprompt({
    title: 'How to: Practice',
    useHtmlLabel: true,
    label: `
    Disclaimer: Practice mode is meant for practice only. While I can't actually stop you, I'd hope that you use practice mode for practicing tough sections, and not winning the level
    <br>To use:
    <br>1. For Best results get to good spot, and quit and rejoin your level
    <br>2. Click "Start Practice"
    <br>3. (Optional) While practicing, you may place checkpoints, which will update the spot you'll spawn when restarting a practice. Always quit and rejoin before placing one for best results!
    <br>4. Click "Restart from last checkpoint" to travel back in time to your last checkpoint
    <br>5. When done practicing, click "end practice," this will bring you back to where you started your practice
    <br>TIP: Nothing you do while practicing (should) affect your real save. You can restart the level, destroy acid blocks, collect powerups, or any other irreversible action, without risk of harming your real save
    `,
    type: "multiInput",
    alwaysOnTop: true,
    multiInputOptions:
      [
        {
          inputAttrs:
          {
            type: "hidden",
          }
        },
      ],
    customStylesheet: darkCssPath,
    width: 600,
    height: 450,
    resizable: true
  });
}


module.exports = {
  getCurrentLevelId,
  startPracticeMode,
  endPracticeMode,
  createCheckpoint,
  restartFromCheckpoint,
  openPracticeHelpMenu,
};