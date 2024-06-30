/* app.js - Mimir app. */

import { CfxRoute, CfxRouter } from "./router.js";
import { home, init as homeInit, onExit as homeOnExit } from "./pages/home.js";
import { favorites, init as favoritesInit, onExit as favoritesOnExit } from "./pages/favorites.js";
import { edit, init as editInit, onRender as editOnRender, onExit as editOnExit } from "./pages/edit.js";
import { newDoc, init as newDocInit, onRender as newDocOnRender, onExit as newDocOnExit } from "./pages/new.js";
import { importDoc, init as importDocInit, onRender as importDocOnRender, onExit as importDocOnExit } from "./pages/import.js";
import { view, init as viewInit, onRender as viewOnRender, onExit as viewOnExit } from "./pages/view.js";
import { settings, init as settingsInit, onExit as settingsOnExit } from "./pages/settings.js";

// Mimir app.
class App {
    // Create the app.
    constructor() {
        this.rootElem = document.getElementById("container");

        // Create router.
        this.router = new CfxRouter(this.rootElem);
        this.routes = [
            new CfxRoute("", home, null, homeOnExit),
            new CfxRoute("favorites", favorites, null, favoritesOnExit),
            new CfxRoute("edit/:path+", edit, editOnRender, editOnExit),
            new CfxRoute("new", newDoc, newDocOnRender, newDocOnExit),
            new CfxRoute("import/:path+", importDoc, importDocOnRender, importDocOnExit),
            new CfxRoute("view/:path+", view, viewOnRender, viewOnExit),
            new CfxRoute("settings", settings, null, settingsOnExit)
        ];
        this.routes.forEach((r) => this.router.addRoute(r));
    }

    // Initialize the app.
    async init() {
        // Init.
        await window.mimirApi.init();

        // Init pages.
        await homeInit();
        await favoritesInit();
        await editInit();
        await newDocInit();
        await importDocInit();
        await viewInit();
        await settingsInit();

        // Init router.
        this.router.serve();
    }

    // Display an error.
    error(data) {
        this.router.displayError("An error occurred in the app.", `Error: ${data}`);
    }
}

export default App;