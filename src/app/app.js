/* app.js - Mimir app. */

import { CfxRoute, CfxRouter } from "./router.js";
import { home, init as homeInit, onExit as homeOnExit } from "./pages/home.js";
import { favorites, init as favoritesInit, onExit as favoritesOnExit } from "./pages/favorites.js";
import { edit, init as editInit, onRender as editOnRender, onExit as editOnExit } from "./pages/edit.js";
import { newDoc, init as newDocInit, onRender as newDocOnRender, onExit as newDocOnExit } from "./pages/new.js";
import { importDoc, init as importDocInit, onRender as importDocOnRender, onExit as importDocOnExit } from "./pages/import.js";
import { view, init as viewInit, onRender as viewOnRender, onExit as viewOnExit } from "./pages/view.js";
import { settings, init as settingsInit, onExit as settingsOnExit } from "./pages/settings.js";
import { splash } from "./pages/splash.js";

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
            new CfxRoute("settings", settings, null, settingsOnExit),
            new CfxRoute("splash", splash, null)
        ];
        this.routes.forEach((r) => this.router.addRoute(r));
    }

    // Initialize the app.
    async init() {
        // Prepare to receive the command line arguments.
        window.mimirApi.on('argv', async function (_, argv) {
            this.argv = argv;
            await this.initUI();
            this.handleCommandLine();
        }.bind(this));

        // Init.
        await window.mimirApi.init();
    }

    // Initialize the UI.
    async initUI() {
        // Init pages.
        await homeInit();
        await favoritesInit();
        await editInit();
        await newDocInit();
        await importDocInit();
        await viewInit();
        await settingsInit();
        
        // Init router.
        this.router.serve("splash");
    }

    // Display an error.
    error(data) {
        this.router.displayError("An error occurred in the app.", `Error: ${data}`);
    }

    // Handle command line arguments.
    handleCommandLine() {
        const router = this.router;
        if (this.argv.length == 2) {
            const path = this.argv[1];
            if (this.router.serving) {
                openPath(path);
                return;
            } else {
                this.router.onServe = (router) => {
                    openPath(path);
                };
                return;
            }
        } else {
            router.navigate("");
        }

        async function openPath(path) {
            try {
                await window.mimirApi.info(path);
            } catch (e) {
                router.navigate("");
                await window.mimirApi.message({ message: `Could not open ${path}. Check that the file exists and is a valid Mimir document.`, type: "error" });
                return;
            }
            router.navigate("edit/" + path);
        }
    }
}

export default App;