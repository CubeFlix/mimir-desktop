/* pages/favorites.js - Favorites page. */

import templateHTML from "./favorites.html";
import rowTemplateHTML from "./doc-row-favorites.html";
import { elem, loadHTML, formatDuration } from "../../lib.js";
import starFilled from "../../assets/star-fill.svg";
import star from "../../assets/star.svg";

let template, rowTemplate;

// Init the favorites page.
async function init() {
    template = (await loadHTML(templateHTML)).childNodes[0];
    rowTemplate = (await loadHTML(rowTemplateHTML)).querySelector("tr");
}

// Generate an individual row, given a router and document.
function generateRow(router, doc) {
    const row = rowTemplate.cloneNode(true);
    const title = row.querySelector(".document-list-title");
    title.innerText = doc.name;
    const subtitle = row.querySelector(".document-list-subtitle");
    const sinceModified = formatDuration(Date.now() - Date.parse(doc.modified));
    subtitle.innerText = `Last modified ${sinceModified} ago - ${doc.path}`;
    const links = row.getElementsByClassName("document-link");
    Array.from(links).forEach((link) => {
        link.addEventListener("click", () => {
            openFile(doc.path, router);
        });
    });
    row.querySelector("#favorite-star").innerHTML = starFilled;
    row.setAttribute("mimir-data-favorite", "true");
    row.querySelector("#favorite-star").addEventListener("click", () => {
        if (row.getAttribute("mimir-data-favorite") == "true") {
            row.setAttribute("mimir-data-favorite", "false");
            row.querySelector("#favorite-star").innerHTML = star;
            window.mimirApi.removeFromFavorites(doc.path);
        } else {
            row.setAttribute("mimir-data-favorite", "true");
            row.querySelector("#favorite-star").innerHTML = starFilled;
            window.mimirApi.addToFavorites(doc.path);
        }
    });
    row.querySelector("#favorite-star").style.opacity = "0";
    row.addEventListener("mouseover", () => {
        row.querySelector("#favorite-star").style.opacity = "1";
    });
    row.addEventListener("mouseout", () => {
        row.querySelector("#favorite-star").style.opacity = "0";
    });
    return row;
}

// No documents.
function noDocuments() {
    const row = elem("tr");
    const cell = elem("td");
    row.append(cell);
    cell.append("No favorites. Click the star icon on a document to favorite it.")
    return row;
}

// Get a list of recent documents.
async function getDocuments() {
    const paths = await window.mimirApi.getFavorites();
    let docs = [];
    for (const path of paths) {
        try {
            const info = await window.mimirApi.info(path);
            info.path = path;
            docs.push(info);
        } catch (e) {
            await window.mimirApi.removeFromFavorites(path);
        }
    }
    return docs;
}

// Open a file.
async function openFile(path, router) {
    try {
        await window.mimirApi.info(path);
    } catch (e) {
        await window.mimirApi.message({ message: `Could not open ${path}. Check that the file exists and is a valid Mimir document.`, type: "error" });
        return;
    }
    router.navigate("edit/" + path);
}

// Re-sort documents.
async function sortDocuments(body, router) {
    // Display recent files.
    const table = body.querySelector(".document-list-table").querySelector("tbody");
    var documents = await getDocuments();
    if (documents.length == 0) {
        // Display empty.
        table.append(noDocuments());
        return body;
    }
    
    // Sort the files.
    const sortChoice = body.querySelector("#sort-by").value;
    if (sortChoice == "date-created") {
        documents.sort((a, b) => b.created - a.created);
    } else if (sortChoice == "last-edited") {
        documents.sort((a, b) => b.modified - a.modified);
    } else if (sortChoice == "last-favorited") { }
    const rows = documents.map(generateRow.bind(generateRow, router));
    table.innerHTML = "";
    table.append(...rows);
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

const events = ["new", "open", "import"];

// Generate the favorites page.
async function favorites(url, params, router) {
    router.setTitle(`Mimir Desktop`);
    const body = elem("div");
    body.append(template.cloneNode(true));

    // New and open buttons.
    body.querySelector("#new-button").addEventListener("click", function() {
        router.navigate("new");
    });
    body.querySelector("#open-button").addEventListener("click", async function() {
        const path = await window.mimirApi.openDialog({ filters: [{name: "Mimir Document", extensions: ["mimir"]}], properties: ["openFile"] });
        if (!path) {
            return;
        }
        openFile(path, router);
    });

    // Sort by option.
    body.querySelector("#sort-by").addEventListener("input", function() {
        sortDocuments(body, router);
    });
    
    // Display favorites.
    const table = body.querySelector(".document-list-table").querySelector("tbody");
    var documents = await getDocuments();
    if (documents.length == 0) {
        // Display empty.
        table.append(noDocuments());
    } else {
        // Sort the files.
        const sortChoice = body.querySelector("#sort-by").value;
        if (sortChoice == "date-created") {
            documents.sort((a, b) => b.created - a.created);
        } else if (sortChoice == "last-edited") {
            documents.sort((a, b) => b.modified - a.modified);
        } else if (sortChoice == "last-favorited") { }

        const rows = documents.map(generateRow.bind(generateRow, router));
        table.append(...rows);
    }

    window.mimirApi.homeMenu();

    function isOnThisPage() {
        return router && router.url.startsWith("favorites");
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

    return body;
}

function onExit() {
    for (const event of events) {
        window.mimirApi.removeAllListeners("mimir:" + event);
    }
}
export { init, favorites, onExit };