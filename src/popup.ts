document.addEventListener('DOMContentLoaded', () => {
    const messageEl = document.getElementById("message");
    if (messageEl) {
        messageEl.textContent = "Hello from your TypeScript-powered popup!";
    }
});


chrome.runtime.sendMessage({ action: "popupOpened", "url": window.location.href });
