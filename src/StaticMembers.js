const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const store = new (Store.default || Store)();

module.exports = {
  window: null,
  app: null,
  menu: null,
  menuTemplate: null,
  clientFileStorageFolder: null,
  persistantStorage: store,
  runEmbeddedScripts,
  getFileName,
  RWKURL: "https://www.robotwantskitty.com/web/",
  // RWKURL: "http://127.0.0.1:8080/",
};

function getFileName(str) {
    return str.split('\\').pop().split('/').pop();
}

function runEmbeddedScripts() {
  console.log("preloading!!!");
  let scriptsToPreRun = [
    "../embeddedscripts/DuplicateSavedLevel.js",
    "../embeddedscripts/getSavedLevelHash.js",
    "../embeddedscripts/PracticeMode.js",
    "../embeddedscripts/IndexDBFileManager.js"
  ];
  try {
    for (let script of scriptsToPreRun) {
      const scriptPath = path.join(__dirname, script);
      const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
      module.exports.window.webContents.executeJavaScript(scriptCode);
    }
  } catch (e) {
    console.error(e);
  }

}