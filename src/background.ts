import {initializeDocContents} from "./lib/parser/DocLookup";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getData") {
        console.log("Background received request for data from:", sender.tab?.id);
        // Return the promise directly. Chrome will automatically send the resolved value as the response.
        
        initializeDocContents(request.url)
            .then((data) => {
                console.log("Data obtained:", data);
                sendResponse(data)
            })
            .catch((error) => {
                console.error("Error in initializeDocContents:", error);
                sendResponse(undefined)
            });
        
        return true;
    }
});
