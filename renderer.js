/* Name: Kevin Wang
 * File: renderer.js
 * ---------------------
 * Converts Markdown into HTML!
 */

import { tokenize } from "./lexer.js";
import { Parser } from "./parser.js";
import { generate } from "./generator.js";
import fs from "fs";

// readFile takes in one argument, filename (string), and returns
// the contents of the file as a string
export function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

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

    // the fruits of our labor...
    return htmlString;
}

let string = readFile("unit_tests/test_files/finale.md");
tokenize(string).slice(350);
// string = "![mcc](https://stanford.edu/~kevjwang/cs106b/finale/images/image2.png)\n_Minecraft Championship's logo overlaid on top of the of the Decision Dome._";
// console.log(tokenize(string).slice(350));
// let result = render(string);
// console.log(result);