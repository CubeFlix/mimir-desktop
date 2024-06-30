/* pages/view.js - Preview page. */

import { elem, loadHTML } from "../../lib.js";
import templateHTML from "./view.html";
import Mimir from "../../libs/mimir.js";
import "../../assets/docicon.svg";
import "../../assets/pencil.svg";
import star from "../../assets/star.svg";
import starFilled from "../../assets/star-fill.svg";
import exportDialogNew from "../components/export.js";
import printDocument from "../components/print.js";
import { wordcountDialogNew } from "../components/wordcount.js";

let router;
let template, body, titlebar, showunsaved, favoriteButton;
let doc, path;
let exportDialog;
let wordcountDialog;
let imageObjectURLs = [];

// Init the home page.
async function init() {
    template = (await loadHTML(templateHTML)).childNodes[0];
}

// Load the document.
async function loadDocument(path) {
    return window.mimirApi.open(path);
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
    return true;
}

function updateFavorite() {
    favoriteButton.innerHTML = doc.isFavorite ? starFilled : star;
}

// Generate the view page.
async function view(url, params, routerObj) {
    router = routerObj;
    body = elem("div");
    body.append(template.cloneNode(true));
    titlebar = body.querySelector(".document-title");
    showunsaved = body.querySelector("#show-unsaved");
    showunsaved.style.display = "none";
    favoriteButton = body.querySelector("#button-favorite"); 
    path = params.path.join("/");

    // Load the document.
    doc = await loadDocument(path);
    updateFavorite();

    // Set title and subtitle.
    titlebar.value = doc.name;
    titlebar.previousElementSibling.textContent = doc.name;

    titlebar.addEventListener("input", () => {
        unsaved = true;
        showunsaved.style.display = "block";
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

    return body;
}

// Exit preview.
function togglePreview() {
    router.navigate(`edit/${path}`);
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
    wordcountDialog.open({editor: body.querySelector("#mimir-body")});
}

const events = ["new", "open", "import", "export", "preview", "goHome", "print", "wordcount"];

// Preview the document.
async function preview() {
    // Sanitize elements and attributes.
    const temp = document.createElement("div");
    temp.innerHTML = doc.content;

    const allowed = []
        .concat(["BR", "DIV", "P", "OL", "UL", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "HR"])
        .concat(["B", "STRONG", "I", "EM", "S", "U", "FONT", "SUP", "SUB", "OL", "UL", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"])
        .concat(["BR", "IMG", "HR"])
        .concat(["SPAN", "A"]);
    const selector = allowed.map((t) => `:not(${t})`).join("");
    if (temp.querySelector(selector)) {
        throw new Error("Invalid tag in document content. Ensure the document is valid.");
    }
    
    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_ELEMENT);
    const allowedAttrs = {
        "A": ["href", "alt", "style"],
        "IMG": ["src", "alt", "class", "style"],
        "FONT": ["size", "color", "face", "style"]
    };
    while (walker.nextNode()) {
        if (allowedAttrs[walker.currentNode.tagName] && walker.currentNode.hasAttributes()) {
            for (const attr of walker.currentNode.attributes) {
                if (!(allowedAttrs[walker.currentNode.tagName].includes(attr.name.toLowerCase()))) {
                    throw new Error("Invalid attribute in document content. Ensure the document is valid.");
                }
            }
            if (walker.currentNode.tagName == "A" && walker.currentNode.getAttribute("href")) {
                if (walker.currentNode.getAttribute("href").trim().substring(0, 11).toLowerCase() == "javascript:") {
                    throw new Error("Invalid attribute in document content. Ensure the document is valid.");
                }
            }
        } else if (walker.currentNode.hasAttributes()) {
            for (const attr of walker.currentNode.attributes) {
                if (!(["style"].includes(attr.name.toLowerCase()))) {
                    throw new Error("Invalid attribute in document content. Ensure the document is valid.");
                }
            }
        }
    }
    
    // Resolve image sources.
    for (const child of temp.querySelectorAll("img")) {
        if (child.getAttribute("src") && child.getAttribute("src").toLowerCase().startsWith("data")) {
            var mime = child.getAttribute("src").split(',')[0].split(':')[1].split(';')[0];
            var binary = atob(child.getAttribute("src").split(',')[1]);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            const blob = new Blob([new Uint8Array(array)], {type: mime});
            var src = URL.createObjectURL(blob);
            child.setAttribute("src", src);
            imageObjectURLs.push(src);
            continue;
        }
    }

    const editor = body.querySelector("#mimir-body");
    editor.style.width = "90%";
    editor.style.minHeight = "0";
    editor.style.fontFamily = "Arial";
    editor.innerHTML = temp.innerHTML;
    function findClosestParent(node, predicate) {
        var currentNode = node;
        while (editor.contains(currentNode) && editor != currentNode) {
            if (predicate(currentNode)) {
                return currentNode;
            }
            currentNode = currentNode.parentElement;
        }
        return null;
    }
    editor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target;
        const nearestLink = findClosestParent(target, (n) => n.tagName == "A");
        if (!nearestLink) {
            return;
        }
        const url = nearestLink.getAttribute("href");
        if (!url) {
            return;
        }
        mimirApi.shellOpenExternal(url);
    });

    const toolbar = body.querySelector("#mimir-menubar");
    var zoomOptions = [];
    for (const zoomLevel of ["50", "75", "90", "100", "125", "150", "175", "200"]) {
        const newZoomOption = document.createElement("div");
        newZoomOption.innerHTML = zoomLevel + "%";
        newZoomOption.style.width = "34px";
        newZoomOption.setAttribute("value", zoomLevel.toLowerCase());
        newZoomOption.setAttribute("title", zoomLevel);
        newZoomOption.setAttribute("aria-label", "Editor adjust zoom " + zoomLevel + "%");
        zoomOptions.push({name: zoomLevel, content: newZoomOption});
    }

    function changeZoom(level) {
        level = parseInt(level) / 100;
        editor.style.MozTransform = `scale(${level})`;
        editor.style.WebkitTransform = `scale(${level})`;
        editor.style.transformOrigin = "top left";
    }
    const defaultZoom = (await window.mimirApi.getSettings())['default-zoom']?.toString();
    const zoomMenubar = new Mimir(null).MimirUI.dropdownList(zoomOptions, changeZoom);
    zoomMenubar.list.setAttribute("id", "mimir-menubar-option-zoom");
    zoomMenubar.dropdown.button.setAttribute("title", "Zoom level");
    zoomMenubar.list.setAttribute("aria-label", "Editor change zoom");
    zoomMenubar.setValue("100");
    if (["50", "75", "90", "100", "125", "150", "175", "200"].includes(defaultZoom)) {
        changeZoom(defaultZoom);
        zoomMenubar.setValue(defaultZoom);
    }
    toolbar.append(zoomMenubar.list);
}

// On render.
async function onRender() {
    try {
        await preview();
    } catch (e) {
        window.mimirApi.message({ message: `Could not load ${path}. ${e}.`, type: "error" });
    }

    // Menubar buttons.
    body.querySelector("#button-home").addEventListener("click", async () => {
        if (await beforeLeaving()) router.navigate("");
    });
    body.querySelector("#button-new").addEventListener("click", async () => {
        if (await beforeLeaving()) router.navigate("new");
    });
    body.querySelector("#button-open").addEventListener("click", () => {
        openFile();
    });
    body.querySelector("#button-favorite").addEventListener("click", () => {
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
        if (await beforeLeaving()) togglePreview();
    });
    body.querySelector("#button-export-open").addEventListener("click", async () => {
        if (!isOnThisPage()) return;
        exportOpen();
    });
    body.querySelector("#button-print").addEventListener("click", () => {
        if (!isOnThisPage()) return;
        printDocument(doc);
    });

    window.mimirApi.previewMenu();

    function isOnThisPage() {
        return router && router.url.startsWith("view");
    }

    window.mimirApi.on("new", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) router.navigate("new");
    });
    window.mimirApi.on("open", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) openFile();
    });
    window.mimirApi.on("preview", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) togglePreview();
    });
    window.mimirApi.on("import", async (event, args) => {
        if (!isOnThisPage()) return;
        if (await beforeLeaving()) importFile();
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

    // Clear the image object URL list and release the URLs.
    while (imageObjectURLs.length != 0) {
        const url = imageObjectURLs.pop();
        URL.revokeObjectURL(url);
    }
}

export { init, view, onRender, onExit };