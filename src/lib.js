/* lib.js - Helper function library. */

// Check if an object is an element. See https://stackoverflow.com/questions/384286.
function isElement(obj) {
    try {
        return obj instanceof HTMLElement;
    }
    catch (e) {
        return (typeof obj === "object") &&
            (obj.nodeType === 1) && (typeof obj.style === "object") &&
            (typeof obj.ownerDocument === "object");
    }
}

// Create an element.
function elem(name) {
    return document.createElement(name);
}

// Load a HTML page template from text.
async function loadHTML(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    
    // Extract the body.
    const fragment = document.createDocumentFragment();
    fragment.append(...doc.body.childNodes);
    return fragment;
}

// Format a duration.
function formatDuration(duration) {
    let value;
    let output = "";
    if (Math.floor(duration / 31556952000)) {
        value = Math.floor(duration / 31556952000);
        output = `${value} years`;
    } else if (Math.floor(duration / 2629746000)) {
        value = Math.floor(duration / 2629746000);
        output = `${value} months`;
    } else if (Math.floor(duration / 604800000)) {
        value = Math.floor(duration / 604800000);
        output = `${value} weeks`;
    } else if (Math.floor(duration / 86400000)) {
        value =  Math.floor(duration / 86400000);
        output = `${value} days` ;
    } else if (Math.floor(duration / 3600000)) {
        value = Math.floor(duration / 3600000);
        output = `${value} hours`;
    } else if (Math.floor(duration / 60000)) {
        value = Math.floor(duration / 60000);
        output = `${value} minutes`;
    } else {
        value = Math.floor(duration / 1000);
        output = `${value} seconds`;
    }
    return output.slice(0, output.length - (value == 1 ? 1 : 0));
}

export { isElement, elem, loadHTML, formatDuration };