/* print.js - Print window. */

const styling = `body {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: Arial;
    font-size: 16;
    pointer-events: none;
}
p, div, br {
    margin: 0;
    line-height: 1;
}
blockquote {
    border-left: 2px solid #aaaaaa;
    padding: 5px;
}`;

function printDocument(doc) {
    var printWindow = window.open();
    printWindow.document.body.innerHTML = doc.content;
    printWindow.document.title = doc.name;
    const styleElem = printWindow.document.createElement("style");
    styleElem.innerHTML = styling;
    printWindow.document.head.append(styleElem);
    if (printWindow.document.readyState == "loading") {
        printWindow.document.addEventListener("DOMContentLoaded", () => {
            printWindow.print();
        });
    } else {
        printWindow.print();
    }
}

export default printDocument;