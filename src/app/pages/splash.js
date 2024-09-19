/* pages/splash.js - Splash screen. */

import { elem } from "../../lib.js";

// Generate the splash screen.
function splash() {
    const splash = elem("div");
    splash.setAttribute("class", "splash");
    return splash;
}

export {
    splash
}