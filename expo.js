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

function injectSolutionButtons() {
    let solutionDivs = document.querySelectorAll("div.solution");

    for (let solutionDiv of solutionDivs) {
        let solutionButton = document.createElement("button");
        solutionButton.className = "clicky portal";
        solutionButton.textContent = "Solution";
        solutionButton.onclick = () => { solutionDiv.classList.toggle("open"); };

        solutionDiv.parentNode.insertBefore(solutionButton, solutionDiv);
    }
}

async function handleInput() {
    try {
        if (isInBrowser()) {
            let rendererTag = document.getElementById("renderer");

            let markdownFile = rendererTag.dataset.src;

            fetch(markdownFile)
                .then((response) => { return response.text() })  // reads the Response and returns a Promise, which is why we need another .then
                .then((markdownContents) => {
                    rendererTag.innerHTML += stylize("theme.css") + render(markdownContents);
                    injectSolutionButtons();
                    MathJax.typesetPromise([rendererTag]);  // render any LaTeX

                    document.querySelectorAll("pre code").forEach(block => {
                        console.log(JSON.stringify(block.textContent));
                    });
                    // hljs.highlightAll();
                    console.log(rendererTag.innerHTML);
                });

            console.log(`RENDERED HTML:`);
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
    catch (error) {
        console.error("An error occurred: ", error.message);
    }
}

function main() {
    handleInput();
}

main();