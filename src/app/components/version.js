/* version.js - Version information. */

const version = "v1.0.0";
const mimirVersion = "v1.0.0";
const message = `Mimir Desktop ${version}. Copyright © cubeflix 2024.`

function renderVersionInfo(body) {
    const p = body.querySelector('#version-info');
    if (p) {
        p.textContent = message;
    }
}

export { 
    renderVersionInfo,
    version,
    mimirVersion,
    message
}