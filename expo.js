/* Name: Kevin Wang
 * File: expo.js
 * -----------------
 * The _main_ file!
 */

import { render } from "./compiler/renderer.js";

Prism.languages.insertBefore("cpp", "keyword", {
    "primitive-type": {
        pattern: /\b(string|char|int|long|double|float)\b/
    },
    "pointer": {
        pattern: /\b(?:\w+::)*\w+(?:<(?:[^<>]|<[^<>]*>)*>)?\*+/g
    },
    "object-type": {
        pattern: /\b(?:Vector|GridLocationRange|GridLocation|Grid|Stack|PriorityQueue|Queue|HashMap|Map|HashSet|Set|Lexicon)\b|(?<=\b(?:struct|class|enum|new)\s+)[A-Z]\w*|^[A-Z]\w*/gm
    },
});

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

        // fill in attributes
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

            fetch(rendererTag.dataset.md)
                .then((response) => { return response.text() })  // reads the Response and returns a Promise, which is why we need another .then
                .then(async (markdownContents) => {
                    // STEP 1: populate renderer tag with styles + actual html
                    rendererTag.innerHTML += stylize(rendererTag.dataset.css) + render(markdownContents);

                    // STEP 2: inject solution buttons
                    injectSolutionButtons();

                    // STEP 3: typeset any math :-)
                    await MathJax.typesetPromise([rendererTag]);

                    // STEP 4: highlight any code blocks!
                    Prism.highlightAllUnder(rendererTag);
                });

            console.log(`RENDERED HTML:`);
            console.log(rendererTag);
        }
        else {
            const fs = await import("fs");

            let inputFile = process.argv[2];
            if (inputFile == undefined) {
                throw new Error("Correct syntax is: node expo.js [markdown file]");
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
        console.error("An error occurred: \n", error.message);
    }
}

function main() {
    handleInput();
}

main();