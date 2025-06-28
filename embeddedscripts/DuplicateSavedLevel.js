

window.electronAPI.duplicateLevel((event, levelName, levelHash) => {
    console.log("Trying to copy: " + levelName);
    console.log("Trying to copy A level: " + levelHash);
    var dbRequest = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
    dbRequest.onsuccess = function (event) {
        var db = event.target.result;

        var request = db.transaction(["FILE_DATA"], "readwrite").objectStore("FILE_DATA").put(
            {
                timestamp: new Date(),
                mode: 33206,
                contents: levelHash
            },
            "/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/" + levelName + ".kitty");

        request.onsuccess = function () {
            console.log("Level saved successfully!");
            location.reload();
        };

        request.onerror = function (event) {
            console.error("Error storing Uint8Array data: ", event.target.error);
        };
    };
    dbRequest.onerror = function(e) {
        console.error(e);
    }
});



function uint8ArrayToBase64(uint8Array) {
    var binaryString = new Uint8Array(uint8Array).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binaryString);
}

0;