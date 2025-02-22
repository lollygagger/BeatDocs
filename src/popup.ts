document.addEventListener('DOMContentLoaded', () => {
    const messageEl = document.getElementById("message");
    if (messageEl) {
        messageEl.textContent = "Hello from your TypeScript-powered popup!";
    }
});

// When the popup loads, it sends a message to the background script.
chrome.runtime.sendMessage({ action: "popupOpened", "url": window.location.href });

// You can also add UI elements (buttons, etc.) that, when clicked,
// send further messages to trigger background tasks.
document.getElementById("doAction")?.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "performAction", "url": window.location.href });
});
