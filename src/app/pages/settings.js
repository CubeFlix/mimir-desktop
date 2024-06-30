/* pages/settings.js - Settings page. */

import templateHTML from "./settings.html";
import { elem, loadHTML } from "../../lib.js";

let template;

// Init the favorites page.
async function init() {
    template = (await loadHTML(templateHTML)).childNodes[0];
}

// Import a file.
async function importFile(router) {
    const path = await window.mimirApi.openDialog({ filters: [
        { name: "HTML Document", extensions: ["html", "htm"] },
        { name: "Text File", extensions: ["txt"] }
    ], properties: ["openFile"] });
    if (!path) {
        return;
    }
    router.navigate("import/" + path);
}

// Update settings values.
async function updateSettings(body) {
    const settingsForm = body.querySelector("#settings");
    const settings = {};

    settings["spellcheck"] = settingsForm.querySelector("#spellcheck").checked;
    settings["default-zoom"] = parseInt(settingsForm.querySelector("#default-zoom").value);
    settings["recent-capacity"] = parseInt(settingsForm.querySelector("#recent-capacity").value);
    await window.mimirApi.setSettings(settings);
}

// Set settings values.
async function setSettings(body) {
    const settingsForm = body.querySelector("#settings");
    const settings = await window.mimirApi.getSettings();

    settingsForm.querySelector("#spellcheck").checked = settings["spellcheck"];
    settingsForm.querySelector("#default-zoom").value = settings["default-zoom"];
    settingsForm.querySelector("#recent-capacity").value = settings["recent-capacity"];
}

async function resetSettings(body) {
    await window.mimirApi.setSettings({ });
    await setSettings(body);
}

const events = ["new", "open", "import"];

// Generate the settings page.
async function settings(url, params, router) {
    const body = elem("div");
    body.append(template.cloneNode(true));

    window.mimirApi.homeMenu();

    function isOnThisPage() {
        return router.url == "settings";
    }

    window.mimirApi.on("new", (event, args) => {
        if (!isOnThisPage()) return;
        router.navigate("new");
    });
    window.mimirApi.on("open", async (event, args) => {
        if (!isOnThisPage()) return;
        const path = await window.mimirApi.openDialog({ filters: [{name: "Mimir Document", extensions: ["mimir"]}], properties: ["openFile"] });
        if (!path) {
            return;
        }
        openFile(path, router);
    });
    window.mimirApi.on("import", async (event, args) => {
        if (!isOnThisPage()) return;
        importFile(router);
    });
    
    body.querySelector("#apply-button").addEventListener("click", () => {
        updateSettings(body);
    });

    body.querySelector("#reset-button").addEventListener("click", () => {
        resetSettings(body);
    });

    await setSettings(body);
    return body;
}

function onExit() {
    for (const event of events) {
        window.mimirApi.removeAllListeners("mimir:" + event);
    }
}
export { init, settings, onExit };