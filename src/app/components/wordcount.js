/* wordcount.js - Word count component. */

import wordcountHTML from "./wordcount.html";

function wordcount(mimir) {
    const plaintext = mimir.editor.innerText;
    const characters = plaintext.length;
    const words = plaintext.split(/[\r\n\t ]+/g).filter((w) => w != "").length;
    return {
        words: words,
        characters: characters
    }
}

function wordcountDialogNew() {
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
    tabView.innerHTML = wordcountHTML;
    content.append(tabView);
    modalBody.append(content);

    let mimir;

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-disabled", "true");

    tabView.querySelector(`#tabview-wordcount-tab`).classList.toggle("tabview-show", true);

    function onKeyPress(event) {
        if (event.key == "Escape") {
            close();
        }
    }

    // Open function.
    function open(mimirObj) {
        document.activeElement.blur();
        mimir = mimirObj;
        if (!modal.classList.contains("modal-show")) {
            modal.classList.add("modal-show");
        }
        modal.setAttribute("aria-hidden", "false");
        modal.setAttribute("aria-disabled", "false");
        modal.dispatchEvent(new Event("modalOpen", {bubbles: true}));
        document.removeEventListener("keydown", onKeyPress);
        document.querySelector(".menubar-container").style.pointerEvents = "none";

        const info = wordcount(mimir);
        modalBody.querySelector("#words").innerText = info.words.toString();
        modalBody.querySelector("#characters").innerText = info.characters.toString();
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

export {
    wordcount, 
    wordcountDialogNew,
};