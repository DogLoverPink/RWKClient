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
                const data = result.contents || result;
                const blob = new Blob([data], { type: "application/octet-stream" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;

                a.download = getFileName(fileName);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

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

window.electronAPI.deleteIndexDBFile((event, fileName) => {
    console.log("STARTING HASH REQUEST");
    var dbAccess = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
    dbAccess.onsuccess = function () {
        const db = dbAccess.result;
        const tx = db.transaction(["FILE_DATA"], "readwrite");
        const store = tx.objectStore("FILE_DATA");

        const allKeysRequest = store.delete(fileName);

        allKeysRequest.onsuccess = function () {
            const result = allKeysRequest.result;
            if (!result) {
                console.log("sucessfully deleted " + fileName);
                window.electronAPI.getRWKURL().then(url => {
                    window.location.replace(url)
                });
            } else {
                console.log("Couldn't delete: " + fileName);
            }
        };
        allKeysRequest.onerror = function (e) {
            console.error("Failed to delete" + fileName, e);
        };

    }
});


window.electronAPI.writeIndexDBFile((event, filePath, levelContents, timestamp = new Date(), mode = 33206, reload) => {
    console.log("Trying to copy to:" + filePath);
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
            console.log("Successfully wrote " + filePath + " reload? " + reload);
            if (reload) {
                window.electronAPI.getRWKURL().then(url => {
                    window.location.replace(url)
                });
            }
        };

        request.onerror = function (event) {
            console.error("Error storing Uint8Array data: ", event.target.error);
        };
    };
    dbRequest.onerror = function (e) {
        console.error(e);
    }
});

0;