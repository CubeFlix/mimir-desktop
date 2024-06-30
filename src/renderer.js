/* main.js - Main entrypoint for Mimir app. */

import App from "./app/app.js";
import "./index.css";

// Initialization function.
function init() {
    const app = new App();
    app.init();
}

// Initialize the app.
if (document.readyState == "complete") {
    init();
} else {
    window.addEventListener("DOMContentLoaded", init);
}