/* main.js - Main entrypoint for Mimir app. */

import App from "./app/app.js";
import "./index.css";

// Initialization function.
async function init() {
    const app = new App();
    await app.init();
}

// Initialize the app.
if (document.readyState == "complete") {
    init();
} else {
    window.addEventListener("DOMContentLoaded", init);
}