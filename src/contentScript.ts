// This code will run on pages that match the content script criteria.
import {orchestratePlay} from "./lib/player/Player";
import {Document} from "./lib/interfaces/NoteInterface";

console.log("Content script loaded!");

(async () => {
    // Trigger when the page is clicked on (temporary)
    document.addEventListener('click', async () => {

        chrome.runtime.sendMessage({ action: "getData", "url": window.location.href }, async (response: Document | undefined) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
                return;
            }
            
            console.log('Document recieved from worker:', response);
           if (!response) {
               console.error('No document recieved from worker')
               return
           }

            await orchestratePlay(response);
        });
    }, { once: true });
    
})();
