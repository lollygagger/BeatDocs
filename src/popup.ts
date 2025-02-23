import {Document} from "./lib/interfaces/NoteInterface";
import * as Tone from "tone";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ballz')?.addEventListener("click", () => pressShit());
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('off')?.addEventListener("click", () => (stopShit()));
});


function stopShit() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {

            if (!tabs[0].id) {
                console.error('No tab id found');
                return
            }

            await chrome.tabs.sendMessage(tabs[0].id, {action: "stopPlaying"});
        }})
}

function pressShit() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {
            const currentUrl = tabs[0].url;

            chrome.runtime.sendMessage({ action: "getData", "url": currentUrl }, async (response: Document | undefined) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    return;
                }

                if (!response) {
                    console.error('No document recieved from worker')
                    return
                }
                
                if (!tabs[0].id) {
                    console.error('No tab id found');
                    return
                }
                
                await chrome.tabs.sendMessage(tabs[0].id, {action: "startPlaying", "document": response});
            });
        }
    });
}
