const path = require('path');
const fs = require('fs');
const storage = require('./StaticMembers.js');
const { ipcMain } = require('electron');
const levelThing = require("./level.js");
const { dialog} = require('electron');
const prompt = require('electron-prompt');

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
    if(r === null) {
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
    width: 500,
    type: 'select'
})
.then((r) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
      console.log(typeof r+": "+[r]);
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


module.exports = {
  getLevelSaves,
  downloadFile,
  downloadFileList
};