//CREDIT (mrmasterplan): https://github.com/mrmasterplan/rwklevelfiles/blob/main/docs/WEB.md
window.electronAPI.getLevelHash((event, levelName, getCurrentLevel, ipcCallbackName) => {
    console.log("STARTING HASH REQUEST");
    var dbRequest = indexedDB.open("/RAPTISOFT_SANDBOX", 21);

    dbRequest.onsuccess = function (event) {
        var db = event.target.result;
        var transaction = db.transaction(["FILE_DATA"], "readonly");
        var objectStore = transaction.objectStore("FILE_DATA");
        var path = "/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/" + levelName + ".kitty"
        if (getCurrentLevel == true) {
            path = "/RAPTISOFT_SANDBOX/RWK/downloaded.kitty";
        }
        var request = objectStore.get(path); // Replace with your key
        console.log("Halfway HASH REQUEST");
        request.onsuccess = function () {
            if (request.result) {
                console.log("Put this into a .kitty.b64:", uint8ArrayToBase64(request.result.
                    contents));
                // window.electronAPI.printToAppConsole(uint8ArrayToBase64(request.result.contents));
                window.electronAPI.sendCustomIPC(ipcCallbackName, uint8ArrayToBase64(request.result.contents));
            } else {
                console.log("No data found for the key");
            }
        };

        request.onerror = function (event) {
            console.error("Error retrieving Uint8Array data: ", event.target.error);
        };
    };

    dbRequest.onerror = function (event) {
        console.error("Error opening database: ", event.target.error);
    };

    function uint8ArrayToBase64(uint8Array) {
        var binaryString = new Uint8Array(uint8Array).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        return btoa(binaryString);
    }
});
0;
