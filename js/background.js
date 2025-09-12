// Register the webRequest listener using service worker
chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        // Service workers do not persist state, so we'll store the state in memory
        // for as long as the worker is alive. Once the worker terminates, the state is lost.
        console.log("Detected URL:", details.url);      //DEBUGGING !!!!
        if (details.tabId !== -1) {
            let contentType = getContentTypeHeader(details.responseHeaders);
            console.log("Content Type:", contentType);  //DEBUGGING !!!!
            if (contentType && allowedContentTypes[contentType]) {
                tabContentTypes[details.tabId] = true;
            } else {
                tabContentTypes[details.tabId] = false;
            }
        }
    },
    { urls: ["*://*/*"], types: ["main_frame"] },
    ["responseHeaders"]
);

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'checktabs') {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            let resultTabs = [];
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i];
                let isImageTab = false;

                // Updated regex to match URLs with query strings defining image formats (e.g., ?format=jpg)
                let match = tab.url.match(/.+\.([^?]+)(?:\?|$)/) || tab.url.match(/format=(jpg|png|gif|webp|webm)/);

                if (tabContentTypes[tab.id] === true) {
                    isImageTab = true;
                } else if (tabContentTypes[tab.id] === false) {
                    isImageTab = false;
                } else if (match) {
                    let extension = match[1].toLowerCase();
                    if (allowedExtensions[extension]) {
                        isImageTab = true;
                    }
                }

                if (isImageTab) {
                    resultTabs.push({ id: tab.id, url: tab.url });
                }
            }
            sendResponse({ tabs: resultTabs });
        });
        return true; // Ensures we can send an async response
    }
});

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//     if (message.type === 'checktabs') {
//         chrome.tabs.query({ currentWindow: true }, function (tabs) {
//             let resultTabs = [];
//             for (let i = 0; i < tabs.length; i++) {
//                 let tab = tabs[i];
//                 let isImageTab = false;
//                 let match = tab.url.match(/.+\.([^?]+)(?:\?|$)/) || tab.url.match(/format=(jpg|png|gif|webp|webm)/);

//                 if (tabContentTypes[tab.id] === true) {
//                     isImageTab = true;
//                 } else if (tabContentTypes[tab.id] === false) {
//                     isImageTab = false;
//                 } else if (match) {
//                     let extension = match[1].toLowerCase();
//                     if (allowedExtensions[extension]) {
//                         isImageTab = true;
//                     }
//                 }

//                 if (isImageTab) {
//                     resultTabs.push({ id: tab.id, url: tab.url });
//                 }
//             }
//             sendResponse({ tabs: resultTabs });
//         });
//         // Indicate async response will be sent
//         return true;
//     }
// });

// Helper function to extract the Content-Type header
function getContentTypeHeader(headers) {
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].name.toLowerCase() === 'content-type') {
            return headers[i].value.toLowerCase().split(';', 1)[0];
        }
    }
    return null;
}

// Allowed content types
const allowedContentTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'video/webm': false
};

// Allowed file extensions
const allowedExtensions = {
    jpg: true,
    jpeg: true,
    png: true,
    gif: true,
    webp: true,
    webm: false
};

// Storage for content types, as service workers don't persist state
let tabContentTypes = {};
