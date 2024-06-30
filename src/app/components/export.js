/* export.js - Export dialog. */

import exportHTML from "./export.html";

function htmlTemplate(doc, options = { }) {
    const output = `<html>
    <head>
        <title>${doc.name}</title>
        <style>
            body {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: Arial;
                font-size: 16;
            }
            p, div, br {
                margin: 0;
                line-height: 1;
            }
            ${options["default-styling"] ? `blockquote {
                border-left: 2px solid #aaaaaa;
                padding: 5px;
            }` : ""}
        </style>
    </head>
    <body>${options["include-title"] ? `<h1>${doc.name}</h1><hr>` : ""}${doc.content}</body>
</html>`;
    return output;
}

function exportDialog() {
    // Create the modal.
    const modal = document.createElement("div");
    modal.classList.add("modal");
    const background = document.createElement("div");
    background.classList.add("modal-background");
    background.style.pointerEvents = "none";
    modal.append(background);
    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modal.append(modalBody);
    const content = document.createElement("div");
    const tabView = document.createElement("div");
    tabView.innerHTML = exportHTML;
    content.append(tabView);
    modalBody.append(content);

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-disabled", "true");

    var doc = null;

    function htmlTab(tabView) {
        const tab = tabView.querySelector("#tabview-html-tab");
        tabView.querySelector("#export-html-button").addEventListener('click', async () => {
            try {
                const options = {
                    "include-title": tab.querySelector("#include-title").checked,
                    "default-styling": tab.querySelector("#default-styling").checked
                }
                const html = htmlTemplate(doc, options);
                const exportPath = await window.mimirApi.saveDialog({ filters: [{name: "HTML Document", extensions: ["html"]}] });
                if (!exportPath) {
                    return;
                }
                await window.mimirApi.exportFile(exportPath, html);
            } catch (e) {
                await window.mimirApi.message({ message: `Failed to export. ${e}`, type: "error" });
            }
        });
    }
    
    function pdfTab(tabView) {
        const tab = tabView.querySelector("#tabview-pdf-tab");
        const loadingText = tab.querySelector("#loading-text");
        tabView.querySelector("#export-pdf-button").addEventListener('click', async () => {
            try {
                const options = {
                    "page-size": tab.querySelector("#page-size").value,
                    "zoom-factor": tab.querySelector("#zoom-factor").value,
                    "default-header": tab.querySelector("#default-header").checked
                }
                const html = htmlTemplate(doc);
                const exportPath = await window.mimirApi.saveDialog({ filters: [{name: "PDF Document", extensions: ["pdf"]}] });
                if (!exportPath) {
                    return;
                }
                loadingText.innerText = "Exporting...";
                const err = await window.mimirApi.exportPDF(exportPath, html, options);
                if (err) {
                    await window.mimirApi.message({ message: `Failed to export. ${err}`, type: "error" });
                }
                loadingText.innerText = "Done.";
            } catch (e) {
                await window.mimirApi.message({ message: `Failed to export. ${e}`, type: "error" });
            }
        });
    }

    function plaintextTab(tabView) {
        const tab = tabView.querySelector("#tabview-plaintext-tab");
        tab.querySelector("#wrap-width").disabled = true;
        tab.querySelector("#word-wrap").addEventListener('input', () => {
            tab.querySelector("#wrap-width").disabled = !tab.querySelector("#word-wrap").checked;
        });
        tabView.querySelector("#export-plaintext-button").addEventListener('click', async () => {
            try {
                const options = {
                    "word-wrap": tab.querySelector("#word-wrap").checked,
                    "wrap-width": tab.querySelector("#wrap-width").value,
                }
                const exportPath = await window.mimirApi.saveDialog({ });
                if (!exportPath) {
                    return;
                }
                const err = await window.mimirApi.exportPlaintext(exportPath, doc.content, options);
                if (err) {
                    await window.mimirApi.message({ message: `Failed to export. ${err}`, type: "error" });
                }
            } catch (e) {
                await window.mimirApi.message({ message: `Failed to export. ${e}`, type: "error" });
            }
        });
    }

    var currentTab = "html";
    const tabs = ["html", "pdf", "plaintext"];
    const functions = { "html": htmlTab, "pdf": pdfTab, "plaintext": plaintextTab };
    for (const tabName of tabs) {
        tabView.querySelector(`#tabview-${tabName}-button`).addEventListener('click', () => {
            tabView.querySelector(`#tabview-${currentTab}-tab`).classList.toggle("tabview-show", false);
            tabView.querySelector(`#tabview-${tabName}-tab`).classList.toggle("tabview-show", true);
            tabView.querySelector(`#tabview-${currentTab}-button`).classList.toggle("tabview-button-active", false);
            tabView.querySelector(`#tabview-${tabName}-button`).classList.toggle("tabview-button-active", true);
            currentTab = tabName;
        });
        functions[tabName](tabView);
    }
    tabView.querySelector(`#tabview-${currentTab}-tab`).classList.toggle("tabview-show", true);
    tabView.querySelector(`#tabview-${currentTab}-button`).classList.toggle("tabview-button-active", true);

    function onKeyPress(event) {
        if (event.key == "Escape") {
            close();
        }
    }

    // Open function.
    function open(docObj) {
        document.activeElement.blur();
        doc = docObj;
        if (!modal.classList.contains("modal-show")) {
            modal.classList.add("modal-show");
        }
        modal.setAttribute("aria-hidden", "false");
        modal.setAttribute("aria-disabled", "false");
        modal.dispatchEvent(new Event("modalOpen", {bubbles: true}));
        document.removeEventListener("keydown", onKeyPress);
        document.querySelector(".menubar-container").style.pointerEvents = "none";
    }

    // Close function.
    function close() {
        if (modal.classList.contains("modal-show")) {
            modal.classList.remove("modal-show");
        }
        modal.setAttribute("aria-hidden", "true");
        modal.setAttribute("aria-disabled", "true");
        modal.dispatchEvent(new Event("modalClose", {bubbles: true}));
        document.removeEventListener("keydown", onKeyPress);
        document.querySelector(".menubar-container").style.pointerEvents = "all";
    }
    tabView.querySelector("#tabview-close-button").addEventListener("click", close);

    return {modal: modal, body: content, open: open, close: close};
}

export default exportDialog;