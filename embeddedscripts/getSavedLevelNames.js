//CREDIT (mrmasterplan): https://github.com/mrmasterplan/rwklevelfiles/blob/main/docs/WEB.md
console.log("meow2");
var dbAccess = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
dbAccess.onsuccess = function () {
  const db = dbAccess.result;
  const tx = db.transaction(["FILE_DATA"], "readonly");
  const store = tx.objectStore("FILE_DATA");

  const allKeysRequest = store.getAllKeys();

  allKeysRequest.onsuccess = function () {
    const allKeys = allKeysRequest.result;
    const rwkKeys = allKeys.filter(
      key => key.startsWith("/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64")
        && key !== "/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64"
    );
    if (window.electronAPI) {
      // window.electronAPI.printToAppConsole(rwkKeys);
      window.electronAPI.updateUserSavedLevelsList(rwkKeys);
    }
  };

  allKeysRequest.onerror = function (e) {
    console.error("Failed to list keys:", e);
  };

};
//I hate you so much Javascript, I spent 2 and a half hours debugging an error, just to find out that my issue was that I didn't add a randon 0; at the end of my file
//And y'know, I was using IPCRenderer logging, and the error I was getting was an error with sending bad data over IPC, so I could only assume that I was the reason
//but no, nooooo, it of course was the super obvious issue that I missed where I didn't add an arbitraury 0; to the end of the file
//because obviously? Isn't that everybody's first, go-to solution? adding random useless characters that would immediatly get stripped out in any sane, or compiled language to their file
//*sigh* this what I get for using Javascript...
0;
