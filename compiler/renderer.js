/* Name: Kevin Wang
 * File: renderer.js
 * ---------------------
 * Converts Markdown into HTML!
 */

import { tokenize } from "./lexer.js";
import { Parser } from "./parser.js";
import { generate } from "./generator.js";

// render takes in one argument, markdownString (string),
// and returns the equivalent translated HTML string!
export function render(markdownString) {
    // STEP 1: tokenize the string!
    let tokens = tokenize(markdownString);

    // STEP 2: turn the list of tokens into a intermediate representaetion
    //         of the program, aka an abstract syntax tree!
    let parser = new Parser(tokens);
    let tree = parser.parse(tokens);

    // STEP 3: turn this intermediate represntation into HTML!!
    let htmlString = generate(tree.root);

    console.log(JSON.stringify(htmlString));

    // the fruits of our labor...
    return htmlString;
}