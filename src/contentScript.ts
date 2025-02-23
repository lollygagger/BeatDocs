// This code will run on pages that match the content script criteria.
import {orchestratePlay} from "./lib/player/Player";
import {Document} from "./lib/interfaces/NoteInterface";

console.log("Content script loaded!");

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "startPlaying") {
        console.log("Background received request for data from:", sender.tab?.id);
        
        let document = request.document as Document;
        
        console.log('Document received from worker:');
        console.log(document);

        await orchestratePlay(document);

        return true;
    }
});
