
window.electronAPI.downloadIndexDBFile((event, fileName) => {
    console.log("STARTING HASH REQUEST");
    var dbAccess = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
    dbAccess.onsuccess = function () {
        const db = dbAccess.result;
        const tx = db.transaction(["FILE_DATA"], "readonly");
        const store = tx.objectStore("FILE_DATA");

        const allKeysRequest = store.get(fileName)

        allKeysRequest.onsuccess = function () {
            const result = allKeysRequest.result;
            if (result) {
                // If result is an object with a `contents` property, use that
                const data = result.contents || result; // adapt as needed
                // Create a Blob (assuming binary data)
                const blob = new Blob([data], { type: "application/octet-stream" });
                // Create a temporary URL
                const url = URL.createObjectURL(blob);

                // Create a temporary <a> element and trigger download
                const a = document.createElement('a');
                a.href = url;

                a.download = getFileName(fileName); // desired filename
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Clean up the URL object
                URL.revokeObjectURL(url);
            } else {
                console.log("No data found for the key");
            }
        };
        allKeysRequest.onerror = function (e) {
            console.error("Failed to list keys:", e);
        };

    }
});

window.electronAPI.getIndexDBFile((event, fileName, ipcCallbackName) => {
    console.log("STARTING HASH REQUEST");
    var dbAccess = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
    dbAccess.onsuccess = function () {
        const db = dbAccess.result;
        const tx = db.transaction(["FILE_DATA"], "readonly");
        const store = tx.objectStore("FILE_DATA");

        const allKeysRequest = store.get(fileName)

        allKeysRequest.onsuccess = function () {
            const result = allKeysRequest.result;
            if (result) {
                window.electronAPI.sendCustomIPC(ipcCallbackName, result);
            } else {
                console.log("No data found for the key: " + fileName);
                window.electronAPI.sendCustomIPC(ipcCallbackName, result);
            }
        };
        allKeysRequest.onerror = function (e) {
            console.error("Failed to list keys:", e);
        };

    }
});

window.electronAPI.writeLevelFile((event, filePath, levelContents, timestamp = new Date(), mode = 33206, practiceLevelID) => {
    console.log("Trying to copy to:" + filePath);
    console.log("Trying to copy A level: " + levelContents);
    var dbRequest = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
    dbRequest.onsuccess = function (event) {
        var db = event.target.result;

        var request = db.transaction(["FILE_DATA"], "readwrite").objectStore("FILE_DATA").put(
            {
                timestamp: timestamp,
                mode: mode,
                contents: levelContents
            },
            filePath);

        request.onsuccess = function () {
            console.log("Practice ending! Reloading");
            setTimeout(() => {
                window.electronAPI.getRWKURL().then(url => {
                    if (practiceLevelID) {
                        const fullURL = url + "?go=" + practiceLevelID;
                        console.log(fullURL);
                        window.electronAPI.printToAppConsole(fullURL);
                        window.location.replace(fullURL);
                    } else {
                        window.location.replace(url)
                    }
                });
            }, 250);
        };

        request.onerror = function (event) {
            console.error("Error storing Uint8Array data: ", event.target.error);
        };
    };
    dbRequest.onerror = function (e) {
        console.error(e);
    }
});

function getFileName(str) {
    return str.split('\\').pop().split('/').pop();
}


window.electronAPI.getLevelsData((event, callbackIPCName) => {
    console.log("STARTING HASH REQUEST");
    var dbAccess = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
    dbAccess.onsuccess = function () {
        const db = dbAccess.result;
        const tx = db.transaction(["FILE_DATA"], "readonly");
        const store = tx.objectStore("FILE_DATA");

        const allKeysRequest = store.getAllKeys();

        allKeysRequest.onsuccess = function () {
            const allKeys = allKeysRequest.result;
            const rwkKeys = allKeys.filter(
                key => key.startsWith("/RAPTISOFT_SANDBOX/RWK"));
            if (window.electronAPI) {
                window.electronAPI.sendCustomIPC(callbackIPCName, rwkKeys);
            }
        };


    }




});
0;