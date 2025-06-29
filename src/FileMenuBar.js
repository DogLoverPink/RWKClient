const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain, ipcRenderer } = require('electron');
const levelThing = require("./level.js");
const { dialog } = require('electron');
const prompt = require('electron-prompt');
const betterprompt = require('custom-electron-prompt')

function promptForFileName() {
  prompt({
    title: 'Choose File To Download',
    label: 'URL:',
    value: '/RAPTISOFT_SANDBOX/RWK/',
    inputAttrs: {
      type: 'text'
    },
    width: 500,
    type: 'input'
  })
    .then((r) => {
      if (r === null) {
        console.log('user cancelled');
      } else {
        storage.window.webContents.send('downloadIndexDBFile', r);
      }
    })
    .catch(console.error);
}

function promptForFileNameList() {
  console.log("Priomoting")
  prompt({
    title: 'Choose File To Download',
    label: 'URL:',
    inputAttrs: {
      type: 'text'
    },
    selectOptions: fileList,
    customStylesheet: "css/darkmode.css",
    width: 500,
    type: 'select'
  })
    .then((r) => {
      if (r === null) {
        console.log('user cancelled');
      } else {
        console.log(typeof r + ": " + [r]);
        storage.window.webContents.send('downloadIndexDBFile', fileList[r]);
      }
    })
    .catch(console.error);
}

function promptForDeletionFileNameList() {
  console.log("Priomoting")
  prompt({
    title: 'Choose File To Download',
    label: 'URL:',
    inputAttrs: {
      type: 'text'
    },
    selectOptions: fileList,
    customStylesheet: "css/darkmode.css",
    width: 500,
    type: 'select'
  })
    .then((r) => {
      if (r === null) {
        console.log('user cancelled');
      } else {
        console.log(typeof r + ": " + [r]);
        storage.window.webContents.send('deleteIndexDBFile', fileList[r]);
      }
    })
    .catch(console.error);
}

let fileList = [];

function downloadFile() {
  promptForFileName();
}

ipcMain.on("getRWKFilesList", (event, data) => {
  fileList = data;
  promptForFileNameList();
});

ipcMain.on("getRWKFilesListForDeletion", (event, data) => {
  fileList = data;
  promptForDeletionFileNameList();
});

ipcMain.on("updateRWKFilesList", (event, data) => {
  fileList = data;
});

function downloadFileList() {
  console.log("Copying1 level:");

  storage.window.webContents.send('getLevelsData', "getRWKFilesList");
}

function updateFileList() {
  storage.window.webContents.send('getLevelsData', "updateRWKFilesList");
}

function getLevelSaves(name) {
  console.log("Copying2 level:", name);
  storage.window.webContents.send('getLevelsData', "printMessage");
}

function deleteFileList() {
  console.log("Copying1 level:");

  storage.window.webContents.send('getLevelsData', "getRWKFilesListForDeletion");
}

ipcMain.on("testGetIndexContents", (event, data) => {
  console.dir(data);

})

function importFile() {
  updateFileList();
  const result = dialog.showOpenDialogSync({ properties: ['openFile'], message: "test!" });
  const newFileList = ["Write Path Manually"].concat(fileList);
  console.log(result);
  if (!result) {
    return;
  }
  betterprompt({
    title: 'Import File',
    label: 'Path to import/override',
    type: "multiInput",
    alwaysOnTop: true,
    multiInputOptions:
      [
        {
          inputAttrs:
          {
            type: "text",
            placeholder: "/RAPTISOFT_SANDBOX/RWK/downloaded.kitty",
            value: '/RAPTISOFT_SANDBOX/RWK/',
          }
        },
        {
          label: "Or, override existing file from list",
          selectOptions: newFileList,
        },
      ],
    button:
    {
      label: "Move from dropdown",
      click: () => {
        const dropDown = document.querySelectorAll("#data")[1];
        document.querySelectorAll("#data")[0].value = dropDown.options[dropDown.value].text;
        dropDown.selectedIndex = 0;
      },
    },
    customStylesheet: "dark",
    width: 600,
    height: 225,
    resizable: true
  }).then(data => {
    if (!data) {
      return;
    }
    let filePath = data[0];
    if (data[1] != 0) {
      filePath = newFileList[data[1]];
    }
    sendImportedFile(result[0], filePath, true);
  });
}

function sendImportedFile(localFilePath, filePathOnServer, shouldReload) {
  if (!localFilePath || !filePathOnServer) {
    return;
  }



  const readFile = fs.readFileSync(localFilePath);

  if (filePathOnServer.endsWith(".kitty")) {
    var level = new levelThing.Level;
    level.deserialize(readFile, 1);
    const actualName = getKittyFileName(filePathOnServer);
    level.name = actualName;
    let levelString = level.serialize();
    storage.window.webContents.send('duplicateLevel', actualName, levelString);
  } else {
    storage.window.webContents.send('writeIndexDBFile', filePathOnServer, readFile, new Date(), 33206, shouldReload);
  }
}

function getKittyFileName(input) {
  input = storage.getFileName(input);
  return input.substring(0, input.length - 6);
}



module.exports = {
  getLevelSaves,
  downloadFile,
  downloadFileList,
  importFile,
  deleteFileList
};