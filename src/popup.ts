document.addEventListener('DOMContentLoaded', () => {
    const messageEl = document.getElementById("message");
    if (messageEl) {
        messageEl.textContent = "Hello from your TypeScript-powered popup!";
    }
});


// Wait for the document to be ready, then bind a click to play the tone
document.addEventListener('click', async () => {
    console.log("Clicked")
});