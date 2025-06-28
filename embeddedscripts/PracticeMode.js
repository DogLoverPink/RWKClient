
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
                console.log("No data found for the key");
            }
        };
        allKeysRequest.onerror = function (e) {
            console.error("Failed to list keys:", e);
        };

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