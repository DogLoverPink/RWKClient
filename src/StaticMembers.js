const path = require('path');
const fs = require('fs');

module.exports = {
  window: null,
  app: null,
  menu: null,
  menuTemplate: null,
  runEmbeddedScripts,
};

function runEmbeddedScripts() {
  let scriptsToPreRun = [
    "../embeddedscripts/level.js",
    "../embeddedscripts/DuplicateSavedLevel.js"
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