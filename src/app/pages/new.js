/* pages/new.js - New page. */

import { elem, loadHTML } from "../../lib.js";
import templateHTML from "./edit.html";
import Mimir from "../../libs/mimir.js";
import star from "../../assets/star.svg";
import starFilled from "../../assets/star-fill.svg";
import exportDialogNew from "../components/export.js";
import printDocument from "../components/print.js";
import { wordcountDialogNew } from "../components/wordcount.js";

let settings;
let router;
let template, body, titlebar, showunsaved, favoriteButton;
let doc, path, mimir;
let exportDialog;
let wordcountDialog;
let unsaved = false;

// Init the new page.
async function init() {
    template = (await loadHTML(templateHTML)).childNodes[0];
}

// Load the document.
async function loadDocument(path) {
    return window.mimirApi.open(path);
}

// Save a document.
async function saveDocument(path, doc) {
    return window.mimirApi.save(path, doc);
}

function updateFavorite() {
    if (doc) favoriteButton.innerHTML = doc.isFavorite ? starFilled : star;
}

// Save.
async function save() {
    // Export the document and add title.
    doc = await mimir.export();
    doc.name = titlebar.value;
    if (!path) {
        path = await window.mimirApi.saveDialog({ filters: [{name: "Mimir Document", extensions: ["mimir"]}] });
        if (!path) {
            return;
        }
    }
    saveDocument(path, doc);
    unsaved = false;
    showunsaved.style.display = "none";
    router.setTitle(`•︎ ${path ? path.split(/[\/\\]+/g).slice(-1)[0] : "Untitled"} - Mimir Desktop`);

    // Display the favorite star now.
    updateFavorite();
}

// Save as.
async function saveAs() {
    if (!path) {
        save();
        return;
    }

    // Get a path to save to.
    const newPath = await window.mimirApi.saveDialog({ filters: [{name: "Mimir Document", extensions: ["mimir"]}] });
    if (!newPath) {
        return;
    }
    path = newPath;
    save();
}

// Open.
async function openFile() {
    if (!beforeLeaving()) return;
    const path = await window.mimirApi.openDialog({ filters: [{name: "Mimir Document", extensions: ["mimir"]}], properties: ["openFile"] });
    if (!path) {
        return;
    }
    try {
        await window.mimirApi.info(path);
    } catch (e) {
        await window.mimirApi.message({ message: `Could not open ${path}. Check that the file exists and is a valid Mimir document.`, type: "error" });
        return;
    }
    router.navigate("edit/" + path);
}

// Before leaving page.
async function beforeLeaving() {
    if (unsaved) {
        const response = (await window.mimirApi.message({ message: `Do you want to save the changes made to ${titlebar.value}?`, type: "question", buttons: ["Save", "Don't Save", "Cancel"] })).response;
        if (response == 0) {
            await save();
        }
        if (response == 2) {
            return false;
        }
    }
    return true;
}

// Preview.
function preview() {
    if (!path) return;
    router.navigate(`view/${path}`);
}

// Import a file.
async function importFile() {
    const path = await window.mimirApi.openDialog({ filters: [
        { name: "HTML Document", extensions: ["html", "htm"] },
        { name: "Text File", extensions: ["txt"] }
    ], properties: ["openFile"] });
    if (!path) {
        return;
    }
    router.navigate("import/" + path);
}

function exportOpen() {
    exportDialog.open(doc);
}

function wordcountOpen() {
    wordcountDialog.open(mimir);
}

function beforeUnload(e) {
    e.preventDefault();
    beforeLeaving().then((shouldClose) => {
        if (shouldClose) {
            window.mimirApi.close();
        }
    });
}

const events = ["new", "open", "save", "save-as", "import", "export", "preview", "undo", "redo", "goHome", "print", "wordcount"];

// Generate the new page.
async function newDoc(url, params, routerObj) {
    router = routerObj;
    body = elem("div");
    body.append(template.cloneNode(true));
    titlebar = body.querySelector(".document-title");
    showunsaved = body.querySelector("#show-unsaved");
    showunsaved.style.display = "none";
    favoriteButton = body.querySelector("#button-favorite");
    path = null;

    settings = await window.mimirApi.getSettings();

    // Set title and subtitle.
    titlebar.value = "Untitled";
    titlebar.previousElementSibling.textContent = "Untitled";
    router.setTitle(`${path ? path.split(/[\/\\]+/g).slice(-1)[0] : "Untitled"} - Mimir Desktop`);

    titlebar.addEventListener("input", () => {
        unsaved = true;
        showunsaved.style.display = "block";
        router.setTitle(`•︎ ${path ? path.split(/[\/\\]+/g).slice(-1)[0] : "Untitled"} - Mimir Desktop`);
    });

    // Handle dynamic input boxes. See https://stackoverflow.com/questions/3392493.
    document.addEventListener('input', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.matches('.resize-input')) return;
        target.previousElementSibling.textContent = target.value;
    });
    Array.from(body.querySelectorAll('.resize-input')).forEach(input => {
        input.previousElementSibling.textContent = input.value;
    });

    exportDialog = exportDialogNew();
    body.append(exportDialog.modal);

    wordcountDialog = wordcountDialogNew();
    body.append(wordcountDialog.modal);

    window.addEventListener('beforeunload', beforeUnload);

    return body;
}

// On render.
function onRender() {
    // Initialize Mimir.
    mimir = new Mimir(document.querySelector("#editor"), { width: "90%", minHeight: "0", spellcheck: settings.spellcheck });
    mimir.init();
    mimir.handleClickLink = (target) => {
        const nearestLink = mimir.findClosestParent(target, (n) => n.tagName == "A");
        if (!nearestLink) {
            return;
        }
        const url = nearestLink.getAttribute("href");
        if (!url) {
            return;
        }
        mimirApi.shellOpenExternal(url);
    };
    mimir.new();
    mimir.editor.setAttribute("cfx-router-no-link", "true");

    if (["50", "75", "90", "100", "125", "150", "175", "200"].includes(settings['default-zoom'].toString())) {
        mimir.applyZoom(settings['default-zoom'].toString());
    }

    // Set the unsaved value.
    mimir.editor.addEventListener("mimiredited", () => {
        unsaved = true;
        showunsaved.style.display = "block";
        router.setTitle(`•︎ ${path ? path.split(/[\/\\]+/g).slice(-1)[0] : "Untitled"} - Mimir Desktop`);
    });

    // Menubar buttons.
    body.querySelector("#button-home").addEventListener("click", async () => {
        if (await beforeLeaving()) router.navigate("");
    });
    body.querySelector("#button-save").addEventListener("click", () => {
        save();
    });
    body.querySelector("#button-open").addEventListener("click", () => {
        openFile();
    });
    body.querySelector("#button-favorite").addEventListener("click", () => {
        if (!doc) {return;}
        if (doc.isFavorite) {
            window.mimirApi.removeFromFavorites(path);
            doc.isFavorite = false;
        } else {
            window.mimirApi.addToFavorites(path);
            doc.isFavorite = true;
        }
        updateFavorite();
    });
    body.querySelector("#button-preview").addEventListener("click", async () => {
        if (await beforeLeaving()) preview();
    });
    body.querySelector("#button-export-open").addEventListener("click", async () => {
        if (!isOnThisPage()) return;
        exportOpen();
    });
    body.querySelector("#button-print").addEventListener("click", () => {
        if (!isOnThisPage()) return;
        printDocument(doc);
    });

    window.mimirApi.editMenu();

    function isOnThisPage() {
        return router && router.url.startsWith("new");
    }

    window.mimirApi.on("new", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) router.navigate("new");
    });
    window.mimirApi.on("open", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) openFile();
    });
    window.mimirApi.on("save", async (event, args) => {
        save();
    });
    window.mimirApi.on("save-as", async (event, args) => {
        saveAs();
    });
    window.mimirApi.on("import", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) importFile();
    });
    window.mimirApi.on("preview", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) preview();
    });
    window.mimirApi.on("undo", async (event, args) => {
        if (!isOnThisPage()) return;
        mimir.undo();
    });
    window.mimirApi.on("redo", async (event, args) => {
        if (!isOnThisPage()) return;
        mimir.redo();
    });
    window.mimirApi.on("goHome", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) router.navigate("");
    });
    window.mimirApi.on("export", async (event, args) => {
        if (!isOnThisPage()) return;
        exportOpen();
    });
    window.mimirApi.on("print", async (event, args) => {
        if (!isOnThisPage()) return;
        printDocument(doc);
    });
    window.mimirApi.on("wordcount", async (event, args) => {
        if (!isOnThisPage()) return;
        wordcountOpen();
    });
}

function onExit() {
    for (const event of events) {
        window.mimirApi.removeAllListeners("mimir:" + event);
    }
    window.removeEventListener('beforeunload', beforeUnload);
    mimir.releaseImageURLs();
}

export { init, newDoc, onRender, onExit };