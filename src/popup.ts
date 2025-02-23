import {Document} from "./lib/interfaces/NoteInterface";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ballz')?.addEventListener("click", () => pressShit());
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('off')?.addEventListener("click", () => (stopShit()));
});

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('record')?.addEventListener("click", () => (stopShit()));
// });

// let audioBlob;
// let recorder: MediaRecorder;
// let audioUrl;
//
// // Record audio
// async function recordAudio() {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     recorder = new MediaRecorder(stream);
//     const audioChunks: BlobPart[] | undefined = [];
//
//     recorder.ondataavailable = function(event) {
//         audioChunks.push(event.data);
//     };
//
//     recorder.onstop = async function() {
//         audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//         audioUrl = URL.createObjectURL(audioBlob);
//         console.log('Recording complete.');
//
//         // Show upload button after recording
//         // @ts-ignore
//         document.getElementById('uploadButton').style.display = 'block';
//     };
//
//     recorder.start();
//     setTimeout(() => {
//         recorder.stop();
//     }, 5000); // Stop after 5 seconds (adjust this as needed)
// };

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
