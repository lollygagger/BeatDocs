import {initialize} from "./lib/parser/DocLookup";

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('ballz')?.addEventListener("click", pressShit);
    // const messageEl = document.getElementById("message");
    // if (messageEl) {
    //     messageEl.textContent = "Hello from your TypeScript-powered popup!";
    // }
    
    console.log(document.getElementById('ballz'));
});

function pressShit() {
    console.log('ahhh');

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {
            const currentUrl = tabs[0].url;
            await initialize(currentUrl);
        }
    });
}

// chrome.runtime.sendMessage({action: "popupOpened", "url": window.location.href});
