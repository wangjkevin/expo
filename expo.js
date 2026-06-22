/* Name: Kevin Wang
 * File: expo.js
 * -----------------
 * The _main_ file!
 */

import { render } from "./compiler/renderer.js";

function isInBrowser() {
    return typeof window !== "undefined";
}

function stylize(cssFile) {
    return `<link rel="stylesheet" href="${cssFile}">`;
}

async function handleInput() {
    if (isInBrowser()) {
        let rendererTag = document.getElementById("renderer");
        rendererTag.innerHTML = stylize("theme.css");

        let markdownFile = rendererTag.dataset.src;

        fetch(markdownFile)
            .then((response) => { return response.text() })  // reads the Response and returns a Promise, which is why we need another .then
            .then((markdownContents) => {
                rendererTag.innerHTML += render(markdownContents);
                MathJax.typesetPromise([rendererTag]);  // render any LaTeX
            });

        console.log(rendererTag);
    }
    else {
        const fs = await import("fs");

        let inputFile = process.argv[2];

        if (inputFile == undefined) {
            console.error("Correct syntax is: node expo.js [markdown file]");
            process.exit(1);
        }

        let markdownContents = fs.readFileSync(inputFile, "utf8");
        let renderedHTML = render(markdownContents);
        console.log("Compiled Markdown to HTML...");

        let outputFile = inputFile.replace(".md", ".html");
        fs.writeFileSync(outputFile, renderedHTML);
        console.log(`Wrote to ${outputFile}!`);
    }
}

function main() {
    handleInput();
}

main();