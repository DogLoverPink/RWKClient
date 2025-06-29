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

let fileList = [];

function downloadFile() {
  promptForFileName();
}

ipcMain.on("getRWKFilesList", (event, data) => {
  fileList = data;
  promptForFileNameList();
});

function downloadFileList() {
  console.log("Copying level:");

  storage.window.webContents.send('getLevelsData', "getRWKFilesList");

}

function getLevelSaves(name) {
  console.log("Copying level:", name);
  storage.window.webContents.send('getLevelsData', "printMessage");
}


function importFile() {
  betterprompt({
    title: 'Import File',
    label: 'Path & Name to Import as',
    value: '/RAPTISOFT_SANDBOX/RWK/',
    type: "multiInput",
    multiInputOptions:
      [
        {
          inputAttrs:
          {
            type: "text",
            required: true,
            placeholder: "email"
          }
        },
        {
          inputAttrs:
          {
            type: "file",
            // placeholder: "password"
          }
        },
      ],
    // customStylesheet: "dark",
    button:
    {
      label: "Autofill",
      click: () => {
        
      },
      attrs:
      {
        abc: 'xyz'
      }
    },
    width: 300,
    height: 225,
  }).then(data => {
    console.dir(data);
  });
}

ipcMain.handle('show-open-test', async () => {
  console.log("TEST!!");
});

ipcMain.handle('show-open-dialog', () => {
  const result = dialog.showOpenDialogSync({ properties: ['openFile'] });
  return result;
});


module.exports = {
  getLevelSaves,
  downloadFile,
  downloadFileList,
  importFile
};