import {initialize} from "./lib/parser/DocLookup";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "popupOpened") {
        console.log("Popup has been opened.");

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs.length > 0 && tabs[0].url) {
                const currentUrl = tabs[0].url;
                await initialize(currentUrl);
            }
        });
    } else if (message.action === "performAction") {
        console.log("Received request to perform background action.");
    }
});
